import logging
from typing import Dict, Any, List

logger = logging.getLogger("debate_coach_performance")

class PerformanceEngine:
    def evaluate_trends(self, history_records: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculates rating trends and improvement trajectories from performance history."""
        if not history_records:
            return {
                "overall_rating": "Beginner",
                "skill_trends": {
                    "debate": "stable",
                    "communication": "stable",
                    "critical_thinking": "stable"
                },
                "average_scores": {
                    "debate": 0.0,
                    "communication": 0.0,
                    "critical_thinking": 0.0
                },
                "growth_percentage": 0.0
            }

        # Calculate averages
        total_debate = 0.0
        total_comm = 0.0
        total_crit = 0.0
        for r in history_records:
            total_debate += r.get("debate_score", 0.0)
            total_comm += r.get("communication_score", 0.0)
            total_crit += r.get("critical_thinking_score", 0.0)

        n = len(history_records)
        avg_debate = total_debate / n
        avg_comm = total_comm / n
        avg_crit = total_crit / n

        # Check trajectory
        if n >= 2:
            growth = history_records[-1].get("debate_score", 0.0) - history_records[0].get("debate_score", 0.0)
        else:
            growth = 0.0

        # Define rating
        avg_overall = (avg_debate + avg_comm + avg_crit) / 3.0
        if avg_overall >= 85.0:
            rating = "Expert"
        elif avg_overall >= 70.0:
            rating = "Advanced"
        elif avg_overall >= 55.0:
            rating = "Intermediate"
        else:
            rating = "Beginner"

        return {
            "overall_rating": rating,
            "skill_trends": {
                "debate": "improving" if growth > 0 else "stable",
                "communication": "improving" if n >= 2 and history_records[-1].get("communication_score", 0.0) > history_records[0].get("communication_score", 0.0) else "stable",
                "critical_thinking": "improving" if n >= 2 and history_records[-1].get("critical_thinking_score", 0.0) > history_records[0].get("critical_thinking_score", 0.0) else "stable"
            },
            "average_scores": {
                "debate": round(avg_debate, 1),
                "communication": round(avg_comm, 1),
                "critical_thinking": round(avg_crit, 1)
            },
            "growth_percentage": round(growth, 1)
        }
