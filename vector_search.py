import logging
from typing import List, Dict, Any

logger = logging.getLogger("debate_coach.vector_search")

class DebateVectorSearch:
    """
    Sentence Transformers & FAISS semantic intelligence engine.
    Has a robust fallback TF-IDF similarity model if optional FAISS packages are not installed.
    """
    def __init__(self):
        self.use_fallback = True
        self.documents = []
        self.metadata = []

        try:
            import faiss
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer("all-MiniLM-L6-v2")
            # Dimension of MiniLM is 384
            self.index = faiss.IndexFlatL2(384)
            self.use_fallback = False
            logger.info("Semantic FAISS index initialized successfully.")
        except Exception as e:
            logger.warning(f"FAISS or SentenceTransformers not available ({e}). Initializing TF-IDF search fallback.")

    def add_documents(self, docs: List[str], metadata: List[Dict[str, Any]]):
        if not docs:
            return
            
        self.documents.extend(docs)
        self.metadata.extend(metadata)
        
        if not self.use_fallback:
            try:
                import numpy as np
                embeddings = self.model.encode(docs)
                self.index.add(np.array(embeddings).astype("float32"))
            except Exception as e:
                logger.error(f"Failed to add documents to FAISS index: {e}. Falling back.")
                self.use_fallback = True

    def search(self, query: str, top_k: int = 2) -> List[Dict[str, Any]]:
        if not self.documents:
            return []

        if not self.use_fallback:
            try:
                import numpy as np
                query_vector = self.model.encode([query])
                distances, indices = self.index.search(np.array(query_vector).astype("float32"), top_k)
                
                results = []
                for idx, dist in zip(indices[0], distances[0]):
                    if idx < len(self.documents) and idx >= 0:
                        results.append({
                            "document": self.documents[idx],
                            "metadata": self.metadata[idx],
                            "score": float(dist)
                        })
                return results
            except Exception as e:
                logger.error(f"FAISS search execution failed: {e}. Executing fallback search.")
                
        # Simple TF-IDF / Substring similarity fallback
        results = []
        words = set(query.lower().split())
        for doc, meta in zip(self.documents, self.metadata):
            matches = sum(1 for w in words if w in doc.lower())
            score = matches / max(1, len(words))
            results.append({
                "document": doc,
                "metadata": meta,
                "score": score
            })
            
        # Sort descending by word match score
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

vector_db = DebateVectorSearch()
