import json
import logging
from typing import Dict, Any
from backend.app.ai.utils.llm import get_llm
from backend.app.ai.prompts.prompt_templates import CLAIM_DETECTION
from backend.app.ai.models.schemas import ClaimExtractionResult

logger = logging.getLogger("debate_coach_extractor")

# spaCy loading fallback
try:
    import spacy
    try:
        nlp = spacy.load("en_core_web_sm")
    except OSError:
        # Try downloading if not exists
        import subprocess
        import sys
        logger.info("Downloading spaCy model en_core_web_sm...")
        subprocess.run([sys.executable, "-m", "spacy", "download", "en_core_web_sm"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        nlp = spacy.load("en_core_web_sm")
except ImportError:
    nlp = None
    logger.warning("spaCy is not installed. Using fallback heuristic extraction.")

class ArgumentExtractor:
    def __init__(self):
        self.llm = get_llm()

    def extract(self, text: str) -> Dict[str, Any]:
        """Extracts claims, premises, evidence, and conclusion from text."""
        # 1. NLP heuristics if spaCy is available
        entities = []
        sentences = []
        
        if nlp is not None:
            doc = nlp(text)
            sentences = [sent.text.strip() for sent in doc.sents]
            entities = [{"text": ent.text, "label": ent.label_} for ent in doc.ents]
        else:
            sentences = [s.strip() for s in text.split(".") if s.strip()]
            entities = []

        # 2. LLM structured analysis for claims, premises, and evidence (using .replace to avoid JSON brackets formatting error)
        prompt = CLAIM_DETECTION.replace("{text}", text)
        try:
            response = self.llm.invoke(prompt, response_format={"type": "json_object"})
            parsed_json = json.loads(response.content)
        except Exception as e:
            logger.error(f"Failed to extract arguments via LLM: {e}")
            parsed_json = {
                "main_claim": {"text": sentences[0] if sentences else text, "confidence": 0.5},
                "supporting_claims": [],
                "counter_claims": []
            }

        # 3. Heuristics for conclusion and premises mapping
        conclusion = text
        premises = []
        evidence = []
        
        conclusion_signals = ["therefore", "thus", "consequently", "in conclusion", "so, ", "leads to the conclusion"]
        evidence_signals = ["for example", "such as", "studies show", "according to", "states that", "evidence", "research", "percent", "%"]

        for sent in sentences:
            sent_lower = sent.lower()
            if any(sig in sent_lower for sig in conclusion_signals):
                conclusion = sent
            elif any(sig in sent_lower for sig in evidence_signals):
                evidence.append(sent)
            else:
                premises.append(sent)

        return {
            "main_claim": parsed_json.get("main_claim", {}).get("text", ""),
            "supporting_claims": [c.get("text", "") for c in parsed_json.get("supporting_claims", [])],
            "counter_claims": [c.get("text", "") for c in parsed_json.get("counter_claims", [])],
            "claim": parsed_json.get("main_claim", {}).get("text", ""),  # DB compatibility
            "premise": "\n".join(premises[:3]) if premises else "Premise not explicitly stated.",
            "evidence": "\n".join(evidence[:2]) if evidence else "Evidence not explicitly stated.",
            "confidence": parsed_json.get("main_claim", {}).get("confidence", 0.5),
            "supporting_statements": premises,
            "conclusion": conclusion,
            "entities": entities
        }
