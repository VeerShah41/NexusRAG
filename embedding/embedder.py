import numpy as np
import google.generativeai as genai
from config import GEMINI_API_KEY

_MODEL_NAME = "models/text-embedding-004"

def get_embeddings(texts: list[str]) -> np.ndarray:
    """
    Generate embeddings for a list of text strings using Gemini API.

    Args:
        texts: List of strings to embed.

    Returns:
        numpy array of shape (len(texts), 768), dtype float32.
    """
    if not texts:
        return np.array([], dtype=np.float32)

    genai.configure(api_key=GEMINI_API_KEY)
    
    # Process in chunks of 100 to respect API limits if needed
    batch_size = 100
    all_embeddings = []
    
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        result = genai.embed_content(
            model=_MODEL_NAME,
            content=batch,
            task_type="retrieval_document"
        )
        embeddings = result['embedding']
        all_embeddings.extend(embeddings)

    embeddings_array = np.array(all_embeddings, dtype=np.float32)
    
    # Normalize embeddings for cosine similarity
    norms = np.linalg.norm(embeddings_array, axis=1, keepdims=True)
    norms[norms == 0] = 1 # avoid division by zero
    embeddings_array = embeddings_array / norms

    return embeddings_array


def get_single_embedding(text: str) -> np.ndarray:
    """
    Generate embedding for a single text string using Gemini API.

    Returns:
        numpy array of shape (1, 768), dtype float32.
    """
    genai.configure(api_key=GEMINI_API_KEY)
    result = genai.embed_content(
        model=_MODEL_NAME,
        content=text,
        task_type="retrieval_query"
    )
    
    embedding = np.array([result['embedding']], dtype=np.float32)
    
    # Normalize
    norm = np.linalg.norm(embedding)
    if norm > 0:
        embedding = embedding / norm
        
    return embedding
