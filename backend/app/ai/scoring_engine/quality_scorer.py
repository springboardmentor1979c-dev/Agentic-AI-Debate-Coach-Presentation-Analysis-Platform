import logging
from typing import Dict, Any, List

logger = logging.getLogger("debate_coach_scorer")

class QualityScorer:
    def calculate(
        self,
        clarity_val: float,
        relevance_val: float,
        evidence_val: float,
        consistency_val: float,
        persuasiveness_val: float
    ) -> Dict[str, float]:
        """Calculates debate argument scores from 0 to 100 with 20% weights each."""
        # Clean inputs
        c = max(0.0, min(100.0, clarity_val))
        r = max(0.0, min(100.0, relevance_val))
        e = max(0.0, min(100.0, evidence_val))
        co = max(0.0, min(100.0, consistency_val))
        p = max(0.0, min(100.0, persuasiveness_val))

        overall = (c * 0.20) + (r * 0.20) + (e * 0.20) + (co * 0.20) + (p * 0.20)
        
        return {
            "clarity": round(c, 1),
            "relevance": round(r, 1),
            "evidence_strength": round(e, 1),
            "logical_consistency": round(co, 1),
            "persuasiveness": round(p, 1),
            "overall_score": round(overall, 1)
        }

    def score_from_analysis(self, text: str, fallacies: List[Dict[str, Any]], reasoning: Dict[str, Any]) -> Dict[str, float]:
        """Scores an argument automatically based on text length, fallacy count, and reasoning evaluation."""
        # Base scores
        clarity = 85.0
        relevance = 80.0
        evidence = 70.0
        consistency = 90.0
        persuasiveness = 75.0

        # Adjust based on fallacies
        fallacy_deductions = {
            "high": 15.0,
            "medium": 8.0,
            "low": 4.0
        }
        for f in fallacies:
            sev = f.get("severity", "medium").lower()
            deduction = fallacy_deductions.get(sev, 8.0)
            consistency -= deduction
            persuasiveness -= (deduction * 0.5)

        # Adjust based on reasoning quality rating
        rq = reasoning.get("overall_quality", "Average").lower()
        if rq == "excellent":
            clarity += 10.0
            persuasiveness += 10.0
        elif rq == "good":
            clarity += 5.0
            persuasiveness += 5.0
        elif rq == "weak":
            clarity -= 15.0
            persuasiveness -= 15.0
            consistency -= 10.0

        # Adjust for evidence signals
        evidence_signals = ["source", "study", "data", "statistics", "report", "according to", "percent", "%", "evidence"]
        found_signals = sum(1 for sig in evidence_signals if sig in text.lower())
        evidence += min(found_signals * 5.0, 25.0)

        # Length validation
        if len(text.split()) < 20:
            clarity -= 15.0
            persuasiveness -= 10.0

        return self.calculate(clarity, relevance, evidence, consistency, persuasiveness)
