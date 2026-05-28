import time
import numpy as np
from google import genai
from google.genai import types
from config import GEMINI_API_KEY

_MODEL_NAME = "gemini-embedding-001"
_BATCH_SIZE = 20       # Max texts per single API call
_DELAY_BETWEEN_BATCHES = 1.0  # seconds between batches to avoid rate limits
_MAX_RETRIES = 5
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


def _embed_with_retry(client, texts: list[str], task_type: str) -> list:
    """
    Call the Gemini embedding API with exponential backoff on 429 errors.
    Sends a list of texts in a single batched API call.
    """
    for attempt in range(_MAX_RETRIES):
        try:
            response = client.models.embed_content(
                model=_MODEL_NAME,
                contents=texts,
                config=types.EmbedContentConfig(task_type=task_type)
            )
            return [e.values for e in response.embeddings]
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                wait = (2 ** attempt) * 3  # 3s, 6s, 12s, 24s, 48s
                print(f"[Embedder] Rate limited. Waiting {wait}s before retry {attempt + 1}/{_MAX_RETRIES}...")
                time.sleep(wait)
            else:
                raise  # Non-rate-limit error, re-raise immediately
    raise RuntimeError(f"[Embedder] Failed after {_MAX_RETRIES} retries due to rate limiting.")


def get_embeddings(texts: list[str]) -> np.ndarray:
    """
    Generate embeddings for a list of text strings using Gemini Embeddings API.
    Processes in batches with retry logic to handle rate limits.

    Args:
        texts: List of strings to embed.

    Returns:
        numpy array of shape (len(texts), 3072), dtype float32.
    """
    if not texts:
        return np.array([], dtype=np.float32)

    client = _get_client()
    all_embeddings = []

    for i in range(0, len(texts), _BATCH_SIZE):
        batch = texts[i:i + _BATCH_SIZE]
        print(f"[Embedder] Embedding batch {i // _BATCH_SIZE + 1} ({len(batch)} texts)...")
        batch_embeddings = _embed_with_retry(client, batch, "RETRIEVAL_DOCUMENT")
        all_embeddings.extend(batch_embeddings)

        # Polite delay between batches to stay within rate limits
        if i + _BATCH_SIZE < len(texts):
            time.sleep(_DELAY_BETWEEN_BATCHES)

    embeddings_array = np.array(all_embeddings, dtype=np.float32)

    # Normalize embeddings for cosine similarity
    norms = np.linalg.norm(embeddings_array, axis=1, keepdims=True)
    norms[norms == 0] = 1
    embeddings_array = embeddings_array / norms

    return embeddings_array


def get_single_embedding(text: str) -> np.ndarray:
    """
    Generate embedding for a single query string using Gemini Embeddings API.

    Returns:
        numpy array of shape (1, 3072), dtype float32.
    """
    client = _get_client()
    result = _embed_with_retry(client, [text], "RETRIEVAL_QUERY")

    embedding = np.array([result[0]], dtype=np.float32)

    # Normalize
    norm = np.linalg.norm(embedding)
    if norm > 0:
        embedding = embedding / norm

    return embedding
