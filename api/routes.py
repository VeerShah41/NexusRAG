import os
import json
import uuid
import shutil
from fastapi import APIRouter, HTTPException, Request, Response, Depends, File, UploadFile, Header
from pydantic import BaseModel

from processing.extractor import extract_text
from processing.chunker import chunk_text
from embedding.embedder import get_embeddings, get_single_embedding
from search.vector_store import (
    add_chunks, search, get_index_stats, get_sample_chunks,
    _load_metadata, _load_index, _save_metadata, _save_index, clear_index
)
from llm.answer import generate_answer, generate_recommendations
from config import get_processed_files_path, get_faiss_index_path, UPLOAD_DIR, STORAGE_DIR, DOWNLOAD_DIR

router = APIRouter()

# ── Dependency for Multi-User ────────────────────────────────────────────────
async def get_user_id(x_user_id: str | None = Header(None)):
    if not x_user_id:
        return "default"
    return x_user_id

# ── Request/Response Models ───────────────────────────────────────────────────

class AskRequest(BaseModel):
    query: str

class SyncRequest(BaseModel):
    folder_id: str | None = None

# ── Direct File Upload ────────────────────────────────────────────────────────

@router.post("/upload", tags=["Upload"])
async def upload_file(file: UploadFile = File(...), user_id: str = Depends(get_user_id)):
    """Upload a document, process it, and index it into FAISS."""
    if not file.filename.lower().endswith(('.pdf', '.txt')):
        raise HTTPException(status_code=400, detail="Only PDF and TXT files are supported.")

    file_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        mime_type = "application/pdf" if file.filename.lower().endswith('.pdf') else "text/plain"
        
        # 1. Extract text
        text = extract_text(file_path, mime_type)
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract any text from the file.")

        # 2. Chunk
        chunks = chunk_text(text, file.filename, file_path, source="upload")
        if not chunks:
            raise HTTPException(status_code=400, detail="File too short to process.")

        # 3. Embed
        texts = [c["chunk_text"] for c in chunks]
        embeddings = get_embeddings(texts)

        # 4. Store in FAISS
        add_chunks(chunks, embeddings, user_id=user_id)

        # Update processed files
        processed_files = {}
        processed_path = get_processed_files_path(user_id)
        if os.path.exists(processed_path):
            with open(processed_path, "r") as f:
                processed_files = json.load(f)
        processed_files[file.filename] = "uploaded"
        with open(processed_path, "w") as f:
            json.dump(processed_files, f, indent=2)

        return {
            "status": "success",
            "file_processed": file.filename,
            "total_new_chunks": len(chunks)
        }

    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

# ── Sync Drive (Public Folders Only) ─────────────────────────────────────────

@router.post("/sync-drive", tags=["Sync"])
def sync_drive(body: SyncRequest = SyncRequest(), user_id: str = Depends(get_user_id)):
    """
    Fetch PDF/TXT files from a public Google Drive folder, 
    process them, and index them into FAISS. Supports incremental sync.
    """
    if not body.folder_id:
        raise HTTPException(
            status_code=400,
            detail="A public Google Drive folder ID is required."
        )

    # Load incremental sync manifest
    processed_files = {}
    processed_path = get_processed_files_path(user_id)
    if os.path.exists(processed_path):
        with open(processed_path, "r") as f:
            processed_files = json.load(f)

    # Fetch files
    try:
        import gdown
        
        folder_url = f"https://drive.google.com/drive/folders/{body.folder_id}"
        out_dir = os.path.join(DOWNLOAD_DIR, body.folder_id)
        os.makedirs(out_dir, exist_ok=True)
        
        # download_folder returns a list of downloaded file paths
        downloaded_files = gdown.download_folder(url=folder_url, output=out_dir, quiet=True, use_cookies=False)
        
        if not downloaded_files:
            raise HTTPException(status_code=400, detail="Folder is empty, invalid, or not publicly accessible.")
            
        drive_files = []
        for filepath in downloaded_files:
            if filepath.lower().endswith('.pdf') or filepath.lower().endswith('.txt'):
                drive_files.append({
                    "id": filepath,  # Use local path as ID
                    "name": os.path.basename(filepath),
                    "mimeType": "application/pdf" if filepath.lower().endswith('.pdf') else "text/plain",
                    "modifiedTime": "public_folder_sync"
                })
            
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Drive fetch error: {str(e)}")

    files_processed = []
    total_chunks = 0
    skipped = 0

    for file in drive_files:
        file_id = file["id"]
        file_name = file["name"]
        mime_type = file["mimeType"]
        modified_time = file.get("modifiedTime", "")

        # ── Incremental sync: skip if already processed and unchanged ──
        if file_id in processed_files and processed_files[file_id] == modified_time:
            print(f"[Sync] Skipping unchanged file: {file_name}")
            skipped += 1
            continue

        print(f"[Sync] Processing: {file_name}")

        try:
            local_path = file_id # path from gdown

            # 2. Extract text
            text = extract_text(local_path, mime_type)
            if not text.strip():
                print(f"[Sync] No text extracted from {file_name}, skipping.")
                continue

            # 3. Chunk
            chunks = chunk_text(text, file_name, file_id, source="gdrive_public")
            if not chunks:
                continue

            # 4. Embed
            texts = [c["chunk_text"] for c in chunks]
            embeddings = get_embeddings(texts)

            # 5. Store in FAISS
            add_chunks(chunks, embeddings, user_id=user_id)

            total_chunks += len(chunks)
            files_processed.append(file_name)

            # Update incremental sync manifest
            processed_files[file_id] = modified_time

        except Exception as e:
            print(f"[Sync] Error processing {file_name}: {e}")
            continue

    # Save updated manifest
    with open(processed_path, "w") as f:
        json.dump(processed_files, f, indent=2)

    return {
        "status": "success",
        "files_processed": len(files_processed),
        "files_skipped_unchanged": skipped,
        "total_new_chunks": total_chunks,
        "files": files_processed,
    }


# ── Ask Question ──────────────────────────────────────────────────────────────

@router.post("/ask", tags=["RAG"])
def ask_question(
    body: AskRequest, 
    user_id: str = Depends(get_user_id),
    x_llm_provider: str | None = Header(None),
    x_llm_api_key: str | None = Header(None)
):
    """
    Answer a natural language question using RAG over indexed documents.
    """
    if not os.path.exists(get_faiss_index_path(user_id)):
        raise HTTPException(
            status_code=400,
            detail="No documents indexed yet. Please upload a document or sync a folder first.",
        )

    query = body.query.strip()
    if not query:
        raise HTTPException(status_code=422, detail="Query cannot be empty.")

    try:
        # 1. Embed the query
        query_embedding = get_single_embedding(query)

        # 2. Retrieve top relevant chunks from FAISS
        top_chunks = search(query_embedding, top_k=5, user_id=user_id)

        # 3. Generate grounded answer via LLM
        result = generate_answer(query, top_chunks, provider=x_llm_provider, api_key=x_llm_api_key)
        
        # 4. Enhance result with relevance scores from top_chunks
        # The search function should now return chunks that have a "relevance_score" key
        # generate_answer will need to pass these chunks back out so frontend can see them

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG error: {str(e)}")


@router.get("/recommend-questions", tags=["RAG"])
def recommend_questions(
    user_id: str = Depends(get_user_id),
    x_llm_provider: str | None = Header(None),
    x_llm_api_key: str | None = Header(None)
):
    """
    Generate 3 suggested questions grounded in the indexed document context.
    """
    try:
        # Get a few sample chunks for context
        samples = get_sample_chunks(n=5, user_id=user_id)
        questions = generate_recommendations(samples, provider=x_llm_provider, api_key=x_llm_api_key)
        return {"questions": questions}
    except Exception as e:
        return {"questions": [
            "What is the main topic of the documents?",
            "Can you summarize the key points?",
            "Are there any specific dates or numbers mentioned?"
        ]}


# ── Status ────────────────────────────────────────────────────────────────────

@router.get("/status", tags=["Health"])
def status(user_id: str = Depends(get_user_id)):
    """Return current system status."""
    stats = get_index_stats(user_id)
    return {
        **stats,
        "user_id": user_id
    }


# ── System Maintenance ────────────────────────────────────────────────────────

@router.get("/documents", tags=["Library"])
def get_documents(user_id: str = Depends(get_user_id)):
    """Return detailed list of indexed documents."""
    stats = get_index_stats(user_id)
    # stats["documents"] is list of {"file_name": str, "doc_id": str}
    # We need to count chunks per document
    metadata = _load_metadata(user_id)
    doc_chunk_counts = {}
    for v in metadata.values():
        fname = v.get("file_name")
        if fname:
            doc_chunk_counts[fname] = doc_chunk_counts.get(fname, 0) + 1
            
    docs = []
    for doc in stats.get("documents", []):
        name = doc["file_name"]
        docs.append({
            "name": name,
            "type": "PDF" if name.lower().endswith('.pdf') else "TEXT",
            "chunks": doc_chunk_counts.get(name, 0),
            "id": doc["doc_id"]
        })
    return docs

@router.delete("/documents/{file_name}", tags=["Library"])
def delete_document(file_name: str, user_id: str = Depends(get_user_id)):
    """Delete a specific document from the FAISS index."""
    import faiss
    import numpy as np
    
    index = _load_index(user_id)
    if not index:
        raise HTTPException(status_code=404, detail="Index not found")
        
    metadata = _load_metadata(user_id)
    
    ids_to_remove = []
    for k, v in metadata.items():
        if v.get("file_name") == file_name:
            ids_to_remove.append(int(k))
            
    if not ids_to_remove:
        raise HTTPException(status_code=404, detail="Document not found in index")
        
    sel = faiss.IDSelectorBatch(np.array(ids_to_remove, dtype=np.int64))
    index.remove_ids(sel)
    
    new_metadata = {}
    new_idx = 0
    # metadata keys might not be contiguous if we screwed up, but they should be 0 to len(metadata)-1
    max_idx = max([int(k) for k in metadata.keys()]) if metadata else -1
    for old_idx in range(max_idx + 1):
        if old_idx not in ids_to_remove and str(old_idx) in metadata:
            new_metadata[str(new_idx)] = metadata[str(old_idx)]
            new_idx += 1
            
    _save_index(index, user_id)
    _save_metadata(new_metadata, user_id)
    
    # Remove physical file
    from config import UPLOAD_DIR
    file_path = os.path.join(UPLOAD_DIR, file_name)
    if os.path.exists(file_path):
        os.remove(file_path)
    
    return {"status": "success", "message": f"Deleted {file_name} and {len(ids_to_remove)} chunks."}

@router.post("/clear-data", tags=["System"])
def clear_data(user_id: str = Depends(get_user_id)):
    """Wipe the FAISS index and local storage."""
    clear_index(user_id)
    from config import get_processed_files_path
    path = get_processed_files_path(user_id)
    if os.path.exists(path):
        os.remove(path)
    return {"status": "success", "message": "Index cleared"}


@router.get("/download-demo", tags=["Sync"])
async def download_demo():
    """Download the demo corpus as a ZIP file."""
    import shutil
    demo_dir = "demo_data"
    if not os.path.exists(demo_dir):
        raise HTTPException(status_code=404, detail="Demo data not found.")
        
    zip_path = "demo_corpus"
    shutil.make_archive(zip_path, 'zip', demo_dir)
    return FileResponse(f"{zip_path}.zip", media_type="application/zip", filename="NexusRAG_Demo_Corpus.zip")

@router.post("/sync-demo", tags=["Sync"])
async def sync_demo(user_id: str = Depends(get_user_id)):
    """Index a set of demo documents for testing."""
    demo_dir = "demo_data"
    if not os.path.exists(demo_dir):
        raise HTTPException(status_code=400, detail="Demo data directory not found.")
        
    demo_files = [f for f in os.listdir(demo_dir) if f.endswith('.txt')]
    
    processed = 0
    total_chunks = 0
    
    for fname in demo_files:
        path = os.path.join(demo_dir, fname)
        try:
            text = extract_text(path, "text/plain")
            chunks = chunk_text(text, fname, f"demo_{fname}", source="demo")
            if chunks:
                texts = [c["chunk_text"] for c in chunks]
                embeddings = get_embeddings(texts)
                add_chunks(chunks, embeddings, user_id=user_id)
                processed += 1
                total_chunks += len(chunks)
        except Exception as e:
            print(f"Demo sync error for {fname}: {e}")
            
    return {
        "status": "success",
        "files_processed": processed,
        "total_new_chunks": total_chunks
    }
