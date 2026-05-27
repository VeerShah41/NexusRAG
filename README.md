# NexusRAG

**Multi-Document Enterprise Search Assistant**

NexusRAG is a robust Retrieval-Augmented Generation (RAG) system built to act as a powerful enterprise search assistant. It allows users to directly upload or sync multiple company documents (PDFs and Text files), process them into a vectorized knowledge base, and ask natural language questions to receive grounded, accurate answers.

This project was built to fulfill **Option 2: Multi-Document Enterprise Search Assistant** of the Full Stack & Gen-AI Assignment.

---

## 🎯 Key Features

1. **Multi-Document Support**: Upload `.pdf` and `.txt` files directly via the browser or sync an entire public Google Drive folder.
2. **Relevance Ranking**: When retrieving context for an answer, the system displays the exact chunks used, their source file, and a visual **relevance score** to ensure transparency.
3. **Advanced RAG Pipeline**:
   - **Text Extraction & Chunking**: Recursive character splitting ensures semantic boundaries are respected.
   - **Embeddings**: Uses `all-MiniLM-L6-v2` for fast, accurate vector embeddings.
   - **Vector Store**: Uses FAISS for lightning-fast similarity search.
   - **LLM Engine**: Powered by Groq (Llama-3.3-70b) or Google Gemini for high-quality, grounded answer generation.
4. **Modern UI**: A premium, responsive React frontend featuring glassmorphism design, real-time status updates, and interactive chat.

---

## 🏗️ Architecture Overview

The system follows a classic RAG architecture decoupled into two main services:

### 1. Frontend (React + Vite)
- **UI Components**: Built using React and Lucide icons.
- **State Management**: React Hooks (`useState`, `useEffect`) handle tab switching, file uploads, and chat history.
- **Styling**: Vanilla CSS with a focus on CSS variables for consistent theming and micro-animations for better UX.

### 2. Backend (FastAPI)
- **API Layer**: `api/routes.py` handles HTTP requests (uploads, sync, chat).
- **Processing Layer**: `processing/extractor.py` and `chunker.py` convert raw files into manageable text chunks.
- **Embedding & Storage**: `embedding/embedder.py` generates vectors which are stored and queried via `search/vector_store.py` (FAISS).
- **LLM Layer**: `llm/answer.py` constructs grounded prompts and interfaces with the LLM provider.

---

## 🧠 Design Decisions & Assumptions

### Design Decisions
- **Local FAISS over Vector Database**: For a lightweight, easily deployable assignment, local FAISS is used instead of a managed vector DB like Pinecone. This reduces external dependencies.
- **Vite + React**: Chosen for rapid frontend development and excellent performance.
- **Decoupled Frontend/Backend**: Although the FastAPI backend serves the compiled React app (`/dist`) for simplicity in a single container, the codebases are completely independent, allowing for separate scaling in the future.

### Assumptions
- **Public Folder Sync**: The Google Drive sync feature assumes the provided folder link is publicly accessible (anyone with the link can view). It uses `gdown` to bypass OAuth complexity for this specific assignment requirement.
- **LLM API Keys**: The user must provide their own Groq or Gemini API keys to generate answers.

---

## 🚀 Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+ (for frontend development)
- A Groq API Key (`GROQ_API_KEY`) or Google Gemini API Key (`GEMINI_API_KEY`)

### 1. Backend Setup

1. Clone the repository and navigate to the root directory.
2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Copy the environment template and add your API keys:
   ```bash
   cp .env.example .env
   # Edit .env and add your GROQ_API_KEY
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

### 2. Frontend Setup

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

*Note: For production, run `npm run build` inside the `frontend` directory. The FastAPI backend is configured to serve the `frontend/dist` folder automatically on `http://localhost:8000/`.*

---

## 📖 API Endpoint Descriptions

- `POST /upload`: Accepts `multipart/form-data` with a file. Extracts text, chunks it, embeds it, and stores it in FAISS.
- `POST /sync-drive`: Accepts a JSON body with a `folder_id`. Downloads public files using `gdown`, processes, and indexes them.
- `POST /ask`: Accepts a JSON body with a `query`. Searches FAISS for the top-k chunks and generates an LLM answer. Returns the answer along with source chunks and their relevance scores.
- `GET /recommend-questions`: Returns 3 suggested questions based on random chunks from the current index.
- `GET /status`: Returns the current stats of the FAISS index (number of chunks, unique documents).
- `POST /clear-data`: Wipes the FAISS index and local storage for a fresh start.
