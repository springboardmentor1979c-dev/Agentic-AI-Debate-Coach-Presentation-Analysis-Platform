"""Recommendation & Coaching Engine (Module 10).

Provides personalized debate improvement recommendations, presentation improvement suggestions,
skill development plans, personalized coaching feedback, and dynamic learning path generation.
"""

from typing import Any, Dict, List


class RecommendationCoachingEngine:
    """Core recommendation and coaching engine for personalized learning pathways."""

    def generate_recommendations(
        self,
        debate_score: float | None = 70.0,
        presentation_score: float | None = 70.0,
        recent_fallacies: List[str] | None = None,
        filler_density: float | None = 0.0,
        user_role: str = "Learner",
        experience_level: str = "Beginner",
    ) -> Dict[str, Any]:
        recent_fallacies = recent_fallacies or []
        deb_score = debate_score if debate_score is not None else 70.0
        pres_score = presentation_score if presentation_score is not None else 70.0
        fill_density = filler_density if filler_density is not None else 0.0

        # 1. Debate Improvement Recommendations
        debate_recs = []
        if deb_score < 75:
            debate_recs.append("Structure arguments using the Claim-Reasoning-Evidence (CRE) framework to elevate initial impact.")
            debate_recs.append("Practice cross-examination rounds focused on exposing underlying opponent assumptions.")
        else:
            debate_recs.append("Incorporate comparative weighing (impact vs probability) in final debate summary speeches.")
            debate_recs.append("Pre-emptively counter top opposing counterarguments during main constructive turns.")

        if recent_fallacies:
            fallacy_str = ", ".join(recent_fallacies[:3])
            debate_recs.append(f"Actively audit speeches for detected fallacy patterns: {fallacy_str}.")

        # 2. Presentation Improvement Suggestions
        pres_recs = []
        if pres_score < 75 or fill_density > 1.5:
            pres_recs.append("Practice 2-second silent pauses to replace filler words ('um', 'uh', 'like', 'you know').")
            pres_recs.append("Vary speaking pace between 120-150 WPM conversational speed to maintain listener engagement.")
        else:
            pres_recs.append("Use rhetorical vocal modulation and posture anchors during key slide transitions.")
            pres_recs.append("Include strong assertion markers ('definitely', 'clearly') to enhance executive presence.")

        # 3. Skill Development Plans (4 Milestones)
        skill_plan = [
            {"milestone": "Foundation (Week 1)", "task": "Complete 3 argument analysis drills and eliminate hedge phrases."},
            {"milestone": "Refinement (Week 2)", "task": "Practice fallacy identification across 5 mock debate transcripts."},
            {"milestone": "Advanced Rebuttal (Week 3)", "task": "Engage in 2 multi-turn AI debate simulations against Socratic and Policy personas."},
            {"milestone": "Mastery (Week 4)", "task": "Deliver a 3-minute keynote pitch scoring >85 on overall performance scorecard."},
        ]

        # 4. Personalized Coaching Feedback
        role_feedback = {
            "Learner": "Focus on deliberate daily practice rounds to build muscle memory in structured rebuttal.",
            "Coach": "Guide learners to identify logical gaps in their own opening statements before live rounds.",
            "Educator": "Assign structured topic briefs and evaluate student improvement trends over 4-week cycles.",
            "Admin": "Ensure platform user engagement metrics and AI model accuracy remain optimal across classes.",
        }.get(user_role, "Focus on deliberate practice rounds.")

        # 5. Learning Path Generation
        learning_path = self.generate_learning_path(experience_level, deb_score, pres_score)

        return {
            "debate_recommendations": debate_recs,
            "presentation_suggestions": pres_recs,
            "skill_development_plan": skill_plan,
            "personalized_coaching_feedback": role_feedback,
            "learning_path": learning_path,
        }

    def generate_learning_path(
        self, experience_level: str = "Beginner", debate_score: float = 70.0, presentation_score: float = 70.0
    ) -> Dict[str, Any]:
        level = (experience_level or "Beginner").capitalize()

        path_modules = [
            {
                "week": "Week 1",
                "focus": "Core Argumentation & Claim Identification",
                "activities": ["Extract premises and conclusions from sample speeches", "Complete 2 Argument Analysis reports"],
            },
            {
                "week": "Week 2",
                "focus": "Fallacy Spotting & Evidence Rigor",
                "activities": ["Audit speeches for 8 major logical fallacies", "Incorporate empirical stats in claims"],
            },
            {
                "week": "Week 3",
                "focus": "Counterargument Strategy & AI Simulation",
                "activities": ["Generate 5-type rebuttals (Logical, Evidence, Ethical, Practical, Policy)", "Run 2 AI Debate Simulation rounds"],
            },
            {
                "week": "Week 4",
                "focus": "Presentation Delivery & Executive Presence",
                "activities": ["Reduce filler word density below 1.0 per 100 words", "Achieve >80 score on Performance Scorecard"],
            },
        ]

        return {
            "target_level": level,
            "recommended_focus": "Rebuttal Strategy & Pace Modulation" if debate_score < presentation_score else "Argumentation & Evidence Density",
            "weekly_modules": path_modules,
        }
