import logging
from ai_providers import ai_provider

logger = logging.getLogger("debate_coach.counterargument")

def generate_counterargument(
    topic: str,
    user_position: str,
    turn_history: list,
    difficulty: str = "Intermediate",
    rebuttal_type: str = "Logical Rebuttal"
) -> str:
    """
    Generate an opposing response (AI turn) from the opponent agent.
    rebuttal_type can be: Logical Rebuttal, Evidence-Based Rebuttal, Ethical Counterargument, Practical Counterargument, Policy Counterargument.
    difficulty affects the sophistication, depth, and tone.
    """
    history_str = "\n".join([f"{t['speaker']}: {t['content']}" for t in turn_history[-4:]])
    
    prompt = f"""
    You are an AI opponent in a debate practice session.
    Topic: "{topic}"
    User Position: "{user_position}" (You must advocate for the OPPOSING position).
    Difficulty Level: {difficulty} (Beginner: simple claims, conversational. Intermediate: clear arguments with reasoning. Advanced: sophisticated rhetoric, challenging rebuttals).
    Rebuttal Strategy: {rebuttal_type}
    
    Recent Turn History:
    {history_str}
    
    Respond with your next turn. Keep the response to exactly 1 single concise paragraph (40-70 words max). Be direct, conversational, and focus on rebutting the user's points in a spoken format. Do not write essays or multiple paragraphs.
    """
    
    response = ai_provider.complete(prompt, system_prompt="You are a focused, eloquent, and analytical debate opponent agent.")
    return response.strip()
