"""
Vector Store service — FAISS-based semantic search for arguments and debates.
Falls back gracefully when faiss is not installed.
"""
import json
import os
import numpy as np
from config import FAISS_INDEX_PATH, EMBEDDING_DIM

_index = None
_metadata: list[dict] = []   # parallel list to FAISS index rows
_faiss_available = False

try:
    import faiss
    _faiss_available = True
except ImportError:
    pass


def _get_index():
    global _index, _metadata
    if _index is not None:
        return _index

    meta_path = FAISS_INDEX_PATH + ".meta.json"
    idx_path = FAISS_INDEX_PATH + ".index"

    if _faiss_available and os.path.exists(idx_path):
        _index = faiss.read_index(idx_path)
        if os.path.exists(meta_path):
            with open(meta_path) as f:
                _metadata = json.load(f)
    elif _faiss_available:
        _index = faiss.IndexFlatL2(EMBEDDING_DIM)

    return _index


def _save_index():
    if not _faiss_available or _index is None:
        return
    faiss.write_index(_index, FAISS_INDEX_PATH + ".index")
    with open(FAISS_INDEX_PATH + ".meta.json", "w") as f:
        json.dump(_metadata, f)


def _embed_text(text: str) -> np.ndarray:
    """
    Generate a text embedding.
    Uses sentence-transformers if available, otherwise falls back to TF-IDF-style hash embedding.
    """
    try:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer("all-MiniLM-L6-v2")
        vec = model.encode([text])[0]
        return vec.astype(np.float32)
    except ImportError:
        pass

    # Deterministic fallback: hash-based pseudo-embedding
    rng = np.random.default_rng(abs(hash(text)) % (2**32))
    vec = rng.standard_normal(EMBEDDING_DIM).astype(np.float32)
    norm = np.linalg.norm(vec)
    return vec / norm if norm > 0 else vec


def add_to_vector_store(text: str, metadata: dict) -> str:
    """Add a text embedding to the vector store. Returns embedding ID."""
    if not _faiss_available:
        return "no-faiss"

    idx = _get_index()
    vec = _embed_text(text).reshape(1, -1)
    embedding_id = str(len(_metadata))
    idx.add(vec)
    _metadata.append({"id": embedding_id, **metadata})
    _save_index()
    return embedding_id


def semantic_search(query: str, top_k: int = 5) -> list[dict]:
    """Search for semantically similar content."""
    if not _faiss_available:
        return []

    idx = _get_index()
    if idx is None or idx.ntotal == 0:
        return []

    vec = _embed_text(query).reshape(1, -1)
    k = min(top_k, idx.ntotal)
    distances, indices = idx.search(vec, k)

    results = []
    for dist, i in zip(distances[0], indices[0]):
        if i < len(_metadata):
            results.append({**_metadata[i], "distance": float(dist)})
    return results
