"""Performance Scoring Engine.

Provides weighted scoring models for Debate Performance (Argument Quality 30%,
Evidence Usage 20%, Logical Consistency 20%, Rebuttal Effectiveness 15%,
Communication Skills 15%), Presentation Performance, Critical Thinking Assessment,
Communication Effectiveness, and Overall Performance Evaluation.
"""

import re
from typing import Any, Dict, List, Tuple


class PerformanceScoringEngine:
    """Core engine for weighted performance scoring and multi-dimensional speaker evaluations."""

    def calculate_debate_score(
        self,
        argument_quality: float,
        evidence_usage: float,
        logical_consistency: float,
        rebuttal_effectiveness: float,
        communication_skills: float,
    ) -> Dict[str, Any]:
        """Calculate weighted Debate Performance Score (30/20/20/15/15 model)."""
        aq = max(0.0, min(100.0, float(argument_quality)))
        eu = max(0.0, min(100.0, float(evidence_usage)))
        lc = max(0.0, min(100.0, float(logical_consistency)))
        re = max(0.0, min(100.0, float(rebuttal_effectiveness)))
        cs = max(0.0, min(100.0, float(communication_skills)))

        # Weighted Scoring Model
        score = round(
            (aq * 0.30) + (eu * 0.20) + (lc * 0.20) + (re * 0.15) + (cs * 0.15),
            1,
        )

        return {
            "debate_score": score,
            "weights": {
                "argument_quality": {"value": aq, "weight_percent": 30, "contribution": round(aq * 0.30, 1)},
                "evidence_usage": {"value": eu, "weight_percent": 20, "contribution": round(eu * 0.20, 1)},
                "logical_consistency": {"value": lc, "weight_percent": 20, "contribution": round(lc * 0.20, 1)},
                "rebuttal_effectiveness": {"value": re, "weight_percent": 15, "contribution": round(re * 0.15, 1)},
                "communication_skills": {"value": cs, "weight_percent": 15, "contribution": round(cs * 0.15, 1)},
            },
        }

    def calculate_presentation_score(
        self,
        pace_delivery: float,
        confidence: float,
        clarity: float,
        engagement: float,
    ) -> Dict[str, Any]:
        """Calculate weighted Presentation Performance Score (25/25/25/25 model)."""
        pd = max(0.0, min(100.0, float(pace_delivery)))
        cf = max(0.0, min(100.0, float(confidence)))
        cl = max(0.0, min(100.0, float(clarity)))
        eg = max(0.0, min(100.0, float(engagement)))

        score = round((pd * 0.25) + (cf * 0.25) + (cl * 0.25) + (eg * 0.25), 1)

        return {
            "presentation_score": score,
            "components": {
                "pace_delivery": pd,
                "confidence": cf,
                "clarity": cl,
                "engagement": eg,
            },
        }

    def evaluate_performance(
        self,
        title: str | None = None,
        text: str | None = None,
        # Optional explicit sub-scores (if provided by user or upstream engines)
        argument_quality: float | None = None,
        evidence_usage: float | None = None,
        logical_consistency: float | None = None,
        rebuttal_effectiveness: float | None = None,
        communication_skills: float | None = None,
        pace_delivery: float | None = None,
        confidence: float | None = None,
        clarity: float | None = None,
        engagement: float | None = None,
    ) -> Dict[str, Any]:
        """Perform full performance evaluation and generate comprehensive scorecard."""
        sample_text = (text or "").strip()

        # If text is provided and sub-scores omitted, derive scores algorithmically
        if sample_text and argument_quality is None:
            derived = self._derive_scores_from_text(sample_text)
            argument_quality = derived["aq"]
            evidence_usage = derived["eu"]
            logical_consistency = derived["lc"]
            rebuttal_effectiveness = derived["re"]
            communication_skills = derived["cs"]
            pace_delivery = derived["pd"]
            confidence = derived["cf"]
            clarity = derived["cl"]
            engagement = derived["eg"]

        # Default fallbacks if both text and scores are omitted
        aq = argument_quality if argument_quality is not None else 75.0
        eu = evidence_usage if evidence_usage is not None else 70.0
        lc = logical_consistency if logical_consistency is not None else 80.0
        re = rebuttal_effectiveness if rebuttal_effectiveness is not None else 72.0
        cs = communication_skills if communication_skills is not None else 78.0

        pd = pace_delivery if pace_delivery is not None else 75.0
        cf = confidence if confidence is not None else 78.0
        cl = clarity if clarity is not None else 82.0
        eg = engagement if engagement is not None else 74.0

        # 1. Debate Performance Scoring (30/20/20/15/15)
        debate_eval = self.calculate_debate_score(
            argument_quality=aq,
            evidence_usage=eu,
            logical_consistency=lc,
            rebuttal_effectiveness=re,
            communication_skills=cs,
        )
        debate_score = debate_eval["debate_score"]

        # 2. Presentation Performance Scoring (25/25/25/25)
        pres_eval = self.calculate_presentation_score(
            pace_delivery=pd, confidence=cf, clarity=cl, engagement=eg
        )
        pres_score = pres_eval["presentation_score"]

        # 3. Critical Thinking Assessment (0-100)
        critical_thinking_score = round((aq * 0.40) + (lc * 0.40) + (eu * 0.20), 1)

        # 4. Communication Effectiveness Scoring (0-100)
        comm_effectiveness_score = round((cs * 0.35) + (cl * 0.35) + (eg * 0.30), 1)

        # 5. Overall Performance Score Calculation
        overall_score = round(
            (debate_score * 0.40)
            + (pres_score * 0.30)
            + (critical_thinking_score * 0.15)
            + (comm_effectiveness_score * 0.15),
            1,
        )

        # 6. Performance Tier Categorization
        tier_info = self._get_performance_tier(overall_score)

        # 7. Strengths, Growth Areas, and Executive Coaching Plan
        strengths, growth_areas, coaching_plan = self._generate_qualitative_feedback(
            debate_eval, pres_eval, critical_thinking_score, comm_effectiveness_score
        )

        return {
            "title": title or "Performance Scorecard",
            "overall_performance_score": overall_score,
            "performance_tier": tier_info["tier"],
            "tier_badge": tier_info["badge"],
            "tier_description": tier_info["description"],
            "scores": {
                "debate_performance": debate_score,
                "presentation_performance": pres_score,
                "critical_thinking": critical_thinking_score,
                "communication_effectiveness": comm_effectiveness_score,
            },
            "debate_breakdown": debate_eval,
            "presentation_breakdown": pres_eval,
            "critical_thinking_assessment": {
                "score": critical_thinking_score,
                "rating": "Advanced Analytical Depth" if critical_thinking_score >= 80 else "Moderate Logical Flow",
            },
            "communication_effectiveness_assessment": {
                "score": comm_effectiveness_score,
                "rating": "High Speaker Impact" if comm_effectiveness_score >= 80 else "Developing Delivery",
            },
            "strengths": strengths,
            "growth_areas": growth_areas,
            "coaching_plan": coaching_plan,
        }

    def _get_performance_tier(self, score: float) -> Dict[str, str]:
        if score >= 90.0:
            return {
                "tier": "Master Orator",
                "badge": "🏆 Master Orator",
                "description": "Exceptional persuasion, airtight logic, robust evidence usage, and commanding executive presence.",
            }
        elif score >= 75.0:
            return {
                "tier": "Proficient Speaker",
                "badge": "🌟 Proficient Speaker",
                "description": "Strong argument structure, solid delivery, and clear reasoning with minor areas for refinement.",
            }
        elif score >= 60.0:
            return {
                "tier": "Developing Communicator",
                "badge": "📈 Developing Communicator",
                "description": "Basic argument formulation is present, but needs stronger evidence backing and refined cadence.",
            }
        else:
            return {
                "tier": "Novice Practice",
                "badge": "🎯 Novice Practice",
                "description": "Formative practice stage. Focus on structured reasoning, reducing fillers, and clear premises.",
            }

    def _derive_scores_from_text(self, text: str) -> Dict[str, float]:
        words = re.findall(r"\b\w+\b", text.lower())
        word_count = len(words)
        sentences = max(1, len(re.split(r"[.!?]+", text)))

        # Evidence markers
        evidence_words = ["data", "percent", "%", "study", "research", "proven", "statistic", "evidence", "according"]
        ev_count = sum(1 for w in words if w in evidence_words)
        eu = min(95.0, max(50.0, 60.0 + (ev_count * 8.0)))

        # Argument Quality & Critical Thinking
        connectives = ["because", "therefore", "furthermore", "however", "thus", "consequently"]
        conn_count = sum(1 for w in words if w in connectives)
        aq = min(95.0, max(55.0, 62.0 + (conn_count * 6.0) + (word_count // 15)))

        lc = min(95.0, max(50.0, 70.0 + (conn_count * 4.0)))
        re_score = min(90.0, max(55.0, 65.0 + (sentences * 3.0)))
        cs = min(95.0, max(60.0, 65.0 + (word_count // 12)))

        pd = 80.0  # Default optimal pace indicator
        cf = min(95.0, max(55.0, 70.0 + (conn_count * 5.0)))
        cl = min(95.0, max(55.0, 75.0 + (conn_count * 3.0)))
        eg = min(95.0, max(50.0, 65.0 + (ev_count * 5.0) + (sentences * 2.0)))

        return {
            "aq": round(aq, 1),
            "eu": round(eu, 1),
            "lc": round(lc, 1),
            "re": round(re_score, 1),
            "cs": round(cs, 1),
            "pd": round(pd, 1),
            "cf": round(cf, 1),
            "cl": round(cl, 1),
            "eg": round(eg, 1),
        }

    def _generate_qualitative_feedback(
        self,
        debate_eval: Dict[str, Any],
        pres_eval: Dict[str, Any],
        critical_thinking: float,
        comm_effectiveness: float,
    ) -> Tuple[List[str], List[str], List[str]]:
        strengths = []
        growth_areas = []
        coaching_plan = []

        weights = debate_eval["weights"]
        if weights["argument_quality"]["value"] >= 80:
            strengths.append("High Argument Quality (30% weight): Formulates strong, compelling claims.")
        else:
            growth_areas.append("Argument Quality (30% weight): Strengthen main assertions with explicit premises.")

        if weights["evidence_usage"]["value"] >= 75:
            strengths.append("Robust Evidence Usage (20% weight): Backs claims with concrete statistics and facts.")
        else:
            growth_areas.append("Evidence Usage (20% weight): Increase usage of empirical studies, data, and citations.")

        if weights["logical_consistency"]["value"] >= 80:
            strengths.append("Logical Consistency (20% weight): Maintains airtight reasoning without contradictions.")

        if pres_eval["components"]["confidence"] >= 80:
            strengths.append("Executive Presence: Projects authoritative confidence and conviction.")

        if comm_effectiveness >= 75:
            strengths.append("Communication Effectiveness: Delivers clear, highly articulate points.")
        else:
            growth_areas.append("Communication Impact: Incorporate transition connectives to guide listener focus.")

        # Executive Coaching Plan
        coaching_plan.append("Target the 30% Argument Quality pillar by using Claim-Reasoning-Evidence structures.")
        coaching_plan.append("Punctuate key debate rebuttals with 1-second deliberate pauses to elevate audience engagement.")
        coaching_plan.append("Practice countering opposing trade-offs explicitly during cross-examination rounds.")

        return strengths, growth_areas, coaching_plan
