import json
from typing import Dict, Any, List
from ai_providers import ai_provider

def generate_coaching_recommendations(
    profile: Dict[str, Any],
    debate_history: List[Dict[str, Any]],
    presentation_history: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Generate personalized recommendations and a structured learning plan
    based on profile goals, history, weakness trends, and scoring.
    """
    prompt = f"""
    Create a personalized coaching report and learning plan for a user.
    
    User Profile Details:
    Goals: "{profile.get('goals', 'Improve debate and speech pacing')}"
    Experience Level: "{profile.get('experience_level', 'Beginner')}"
    Preferred Topics: "{profile.get('preferred_topics', 'Technology, Climate')}"
    
    Recent Debate History:
    {json.dumps(debate_history[:3])}
    
    Recent Presentation History:
    {json.dumps(presentation_history[:3])}
    
    Return EXACTLY a JSON object with this schema:
    {{
      "recommendations": ["list of personalized actionable tips"],
      "learning_path": ["step-by-step milestones to complete"],
      "recommended_exercises": ["specific exercises or topic formats to practice next"]
    }}
    """
    
    response = ai_provider.complete(prompt, system_prompt="You are a personal Debate & Speech Coach. Return clean, valid JSON only.", json_mode=True)
    try:
        data = json.loads(response)
        return data
    except Exception:
        # Fallback defaults if generation is interrupted
        return {
            "recommendations": [
                "Slow down your speaking pace during the opening remarks to improve clarity.",
                "Structure your claims using the 'PEEL' format (Point, Evidence, Explanation, Link)."
            ],
            "learning_path": [
                "Milestone 1: Complete 3 Oxford-style AI simulation debates on technology topics.",
                "Milestone 2: Reduce your filler-word density below 4% in a presentation session."
            ],
            "recommended_exercises": [
                "Oxford Format - Topic: 'Social Media Bans for Minors' - Side: Negation",
                "Spontaneous Delivery Practice - Topic: 'The Ethics of Self-Driving Cars'"
            ]
        }
