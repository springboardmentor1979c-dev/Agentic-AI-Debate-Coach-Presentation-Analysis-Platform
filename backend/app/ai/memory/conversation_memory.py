import json
import logging
from typing import Dict, Any, List

logger = logging.getLogger("debate_coach_memory")

class ConversationMemory:
    def __init__(self):
        self.claims = []
        self.evidence = []
        self.arguments = []
        self.contradictions = []
        self.repeated_mistakes = []

    def load_from_history(self, history: List[Dict[str, str]]):
        """Processes previous debate history to populate memory attributes."""
        self.arguments = [h.get("message", "") for h in history]
        
        # Heuristic detection of potential repetition
        seen_sentences = set()
        for idx, msg in enumerate(self.arguments):
            msg_lower = msg.lower()
            sentences = [s.strip() for s in msg_lower.split(".") if len(s.strip()) > 8]
            
            for sent in sentences:
                if sent in seen_sentences:
                    mistake = f"Repetitive statement in round: '{sent[:40]}...'"
                    if mistake not in self.repeated_mistakes:
                        self.repeated_mistakes.append(mistake)
                else:
                    seen_sentences.add(sent)

            # Look for contradictions (heuristically, e.g. claiming both UBI increases and decreases inflation without justification)
            if "increases inflation" in msg_lower and "decreases inflation" in msg_lower:
                self.contradictions.append("Claimed UBI simultaneously increases and decreases inflation.")

    def get_summary(self) -> Dict[str, Any]:
        """Returns structured memory state."""
        return {
            "claims_recorded": self.claims,
            "evidence_cited": self.evidence,
            "contradictions_found": self.contradictions,
            "repeated_mistakes": self.repeated_mistakes
        }
