import os
from dotenv import load_dotenv

load_dotenv()

# ── Google OAuth Configuration ────────────────────────────────────────────────
# Removed as per new requirements

# ── LLM ───────────────────────────────────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "groq")  # "groq" or "gemini"

# ── Storage ───────────────────────────────────────────────────────────────────
STORAGE_DIR = os.getenv("STORAGE_DIR", "./storage")
DOWNLOAD_DIR = os.getenv("DOWNLOAD_DIR", "./downloads")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")

# Create directories if they don't exist
os.makedirs(STORAGE_DIR, exist_ok=True)
os.makedirs(DOWNLOAD_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_user_dir(user_id: str = "default_user") -> str:
    user_dir = os.path.join(STORAGE_DIR, user_id)
    os.makedirs(user_dir, exist_ok=True)
    return user_dir

def get_faiss_index_path(user_id: str = "default_user") -> str:
    return os.path.join(get_user_dir(user_id), "faiss_index.bin")

def get_metadata_path(user_id: str = "default_user") -> str:
    return os.path.join(get_user_dir(user_id), "faiss_metadata.json")

def get_processed_files_path(user_id: str = "default_user") -> str:
    return os.path.join(get_user_dir(user_id), "processed_files.json")
