import numpy as np
from google import genai
from google.genai import types
from config import GEMINI_API_KEY

_MODEL_NAME = "gemini-embedding-001"
_client = None


def _get_client():
    """Lazy-init the Gemini genai client forcing v1 API."""
    global _client
    if _client is None:
        _client = genai.Client(
            api_key=GEMINI_API_KEY,
            http_options={"api_version": "v1"}
        )
    return _client


def get_embeddings(texts: list[str]) -> np.ndarray:
    """
    Generate embeddings for a list of text strings using Gemini Embeddings API.

    Args:
        texts: List of strings to embed.

    Returns:
        numpy array of shape (len(texts), 768), dtype float32.
    """
    if not texts:
        return np.array([], dtype=np.float32)

    client = _get_client()
    all_embeddings = []

    for text in texts:
        response = client.models.embed_content(
            model=_MODEL_NAME,
            contents=text,
            config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT")
        )
        all_embeddings.append(response.embeddings[0].values)

    embeddings_array = np.array(all_embeddings, dtype=np.float32)

    # Normalize embeddings for cosine similarity
    norms = np.linalg.norm(embeddings_array, axis=1, keepdims=True)
    norms[norms == 0] = 1
    embeddings_array = embeddings_array / norms

    return embeddings_array


def get_single_embedding(text: str) -> np.ndarray:
    """
    Generate embedding for a single text string using Gemini Embeddings API.

    Returns:
        numpy array of shape (1, 768), dtype float32.
    """
    client = _get_client()
    response = client.models.embed_content(
        model=_MODEL_NAME,
        contents=text,
        config=types.EmbedContentConfig(task_type="RETRIEVAL_QUERY")
    )

    embedding = np.array([response.embeddings[0].values], dtype=np.float32)

    # Normalize
    norm = np.linalg.norm(embedding)
    if norm > 0:
        embedding = embedding / norm

    return embedding
