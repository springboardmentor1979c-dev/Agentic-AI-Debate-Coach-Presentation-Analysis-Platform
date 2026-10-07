import os
import json
import logging
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage, AIMessage

# Configure logging
logger = logging.getLogger("debate_coach_llm")

# Load dotenv
load_dotenv()

class MockLLM:
    """Mock LLM to fallback when no API keys are present.
    It parses prompt queries and generates structured mock JSON responses.
    """
    def __init__(self, model_name: str = "mock-model"):
        self.model_name = model_name

    def invoke(self, messages, response_format=None, **kwargs) -> AIMessage:
        # Resolve prompt text from messages
        prompt_text = ""
        if isinstance(messages, str):
            prompt_text = messages
        elif isinstance(messages, list):
            prompt_text = "\n".join([m.content if hasattr(m, 'content') else str(m) for m in messages])
        else:
            prompt_text = str(messages)

        logger.warning(f"Using MockLLM: API Key not set. Prompt signature analysed. Output format required: {response_format}")
        
        # Analyze prompt and return appropriate mock structure
        content = "{}"
        prompt_lower = prompt_text.lower()
        
        # 1. Check for specific keywords first to avoid generic overrides
        if "rebuttal" in prompt_lower or "rebuttal generation" in prompt_lower:
            content = json.dumps({
                "rebuttal": "The opposition asserts that UBI is financially unfeasible. However, this ignores the cost offsets from consolidated social services and the progressive taxation of automated infrastructure.",
                "points_addressed": ["Cost feasibility", "Workforce discouragement"]
            })
        elif "counterarguments" in prompt_lower or "counterargument generation" in prompt_lower:
            content = json.dumps({
                "counterarguments": [
                    {
                        "counter_type": "economic",
                        "counter_argument": "UBI requires tax hikes that suppress business investment.",
                        "explanation": "Increasing corporate taxes to fund UBI may reduce capital development.",
                        "strength": 80.0,
                        "possible_user_reply": "Corporate taxes are offset by increased consumer purchasing power."
                    },
                    {
                        "counter_type": "practical",
                        "counter_argument": "Implementing UBI creates massive administrative overhead.",
                        "explanation": "Distributing cash monthly requires extensive banking and registry systems.",
                        "strength": 65.0,
                        "possible_user_reply": "Digital wallets and direct bank deposit protocols minimize this overhead."
                    }
                ]
            })
        elif "weekly_plan" in prompt_lower or "duration_days" in prompt_lower or "learning plan" in prompt_lower:
            content = json.dumps({
                "goal": "Improve logical reasoning and evidence integration",
                "difficulty": "Intermediate",
                "duration_days": 7,
                "weekly_plan": [
                    {
                        "week": 1,
                        "focus": "Evidence Framing and Fallacy Minimization",
                        "days": [
                            {"day": 1, "exercise": "Identify Fallacies", "description": "Review two political transcripts and circle logical fallacies."},
                            {"day": 2, "exercise": "Evidence Validation", "description": "Find three academic sources supporting UBI feasibility."},
                            {"day": 3, "exercise": "Stance Reversal", "description": "Draft an argument from the negative stance on your preferred topic."},
                            {"day": 4, "exercise": "Structure Drill", "description": "Write a 3-minute opening statement using the claim-evidence-impact format."},
                            {"day": 5, "exercise": "Cross-Exam practice", "description": "Draft 5 probing questions challenging UBI funding metrics."},
                            {"day": 6, "exercise": "Pacing check", "description": "Record yourself speaking at 130 WPM using a teleprompter."},
                            {"day": 7, "exercise": "Simulation", "description": "Complete a full 3-round debate session on the dashboard."}
                        ]
                    }
                ],
                "recommended_exercises": [
                    {
                        "name": "The Fallacy Hunt",
                        "exercise_type": "Logical Reasoning",
                        "instructions": "Read an editorial page and label at least 3 distinct fallacy types."
                    }
                ]
            })
        elif "fallacies" in prompt_lower or "logical fallacies" in prompt_lower:
            content = json.dumps({
                "fallacies": [
                    {
                        "fallacy_type": "Ad Hominem",
                        "severity": "High",
                        "description": "The speaker attacks the opponent's character instead of their argument.",
                        "correction": "Focus on the evidence of the policy instead of personal attributes.",
                        "highlighted_sentence": "You wouldn't understand this policy because you have never worked a real job.",
                        "example": "This policy fails because its cost calculations ignore recent inflation indices."
                    },
                    {
                        "fallacy_type": "Slippery Slope",
                        "severity": "Medium",
                        "description": "Claiming a small step will lead to a chain of negative events without proof.",
                        "correction": "Provide empirical evidence showing a causal link between these steps.",
                        "highlighted_sentence": "If we allow this minor amendment, the entire constitution will be dismantled.",
                        "example": "If we pass this amendment, it will create a legal precedent for subsequent structural reviews."
                    }
                ]
            })
        elif "improved_argument" in prompt_lower or "argument improvement" in prompt_lower:
            content = json.dumps({
                "improved_argument": "While critics suggest that Universal Basic Income encourages workforce withdrawal, pilot programs indicate UBI supports career transitions and maintains local purchasing power. As automation displaces routine labor, UBI is a necessary economic stabilizer.",
                "wording_tips": "Avoid absolute claims like 'everyone will lose their job'; use calibrated phrases like 'displacement of routine labor'.",
                "structural_tips": "Open with the counter-stance, rebut it with statistical trends, and conclude with the systemic benefit."
            })
        elif "reasoning" in prompt_lower or "logical flow" in prompt_lower:
            content = json.dumps({
                "logical_flow": "The argument transitions smoothly from the premise of technological job displacement to the necessity of UBI.",
                "consistency": "Highly consistent. There are no contradictions between the stated economic metrics.",
                "validity": "Valid. The deductive reasoning holds under the assumption of UBI implementation.",
                "coherence": "Coherent and structured, utilizing logical linkers.",
                "reasoning_chain": [
                    "Premise 1: AI and automation are replacing routine workforce roles.",
                    "Premise 2: Workers require income support to maintain consumer capacity.",
                    "Conclusion: UBI acts as a viable buffer to sustain the automation transition."
                ],
                "overall_quality": "Excellent"
            })
        elif "strengths" in prompt_lower and "weaknesses" in prompt_lower and "better_wording" in prompt_lower:
            # Coaching feedback
            content = json.dumps({
                "scores": {
                    "confidence": 85.0,
                    "persuasiveness": 78.0,
                    "reasoning": 82.0,
                    "logic": 75.0,
                    "evidence": 80.0,
                    "communication": 88.0
                },
                "strengths": [
                    "Excellent structured delivery.",
                    "Use of rhetorical questions engaged the audience."
                ],
                "weaknesses": [
                    "Slight Ad Hominem fallacy detected in the rebuttal.",
                    "Missing detailed statistical backing for UBI cost estimates."
                ],
                "recommendations": [
                    "Focus more on economic feasibility statistics.",
                    "Rephrase personal remarks into structured counterarguments."
                ],
                "better_wording": "Rather than saying 'my opponent is completely out of touch', you can say 'the opposing argument overlooks the microeconomic realities of low-income workers'.",
                "missing_evidence": [
                    "Cite the 2021 Stockton UBI pilot program metrics.",
                    "Incorporate IMF reports on labor displacement."
                ],
                "speaking_advice": "Maintain a steady pace (around 130 WPM) during complex statistical explanations.",
                "skill_focus": "Evidence integration and logical framing"
            })
        elif "strengths" in prompt_lower and "weaknesses" in prompt_lower:
            # Feedback result
            content = json.dumps({
                "strengths": ["Clear articulation", "Solid introduction of the core thesis statement"],
                "weaknesses": ["Lack of expert citations", "Weak transition to counter-points"],
                "missing_evidence": ["Statistical studies on automation rates", "Government employment projections"],
                "improvement_tips": ["Include at least two credible source names", "Use transition words like 'Furthermore'"]
            })
        elif "claim" in prompt_lower or "main claim" in prompt_lower:
            content = json.dumps({
                "main_claim": {
                    "text": "Universal Basic Income is necessary to stabilize the economy in an automated job market.",
                    "confidence": 0.92
                },
                "supporting_claims": [
                    {"text": "Automation will displace up to 30% of standard operational jobs by 2035.", "confidence": 0.88},
                    {"text": "UBI increases local consumer spending and supports career transitions.", "confidence": 0.85}
                ],
                "counter_claims": [
                    {"text": "UBI may lead to significant inflation and discourage active employment.", "confidence": 0.80}
                ]
            })
        elif "opening_statement" in prompt_lower or "debate opening" in prompt_lower:
            content = json.dumps({
                "opening_statement": "Distinguished judges, debate colleagues. Today we stand at a critical historical juncture. As AI advances, we must proactively restructure our social safety net. I affirm the resolution that government should institute UBI to buffer automation.",
                "key_points": [
                    "Automation threatens standard employment sectors.",
                    "UBI prevents poverty and stimulates local consumer markets.",
                    "Economic transitions require centralized social safety support."
                ]
            })
        elif "communication" in prompt_lower and "slide_improvements" in prompt_lower:
            # Presentation evaluation
            content = json.dumps({
                "scores": {
                    "communication": 82.0,
                    "confidence": 75.0,
                    "structure": 88.0,
                    "engagement": 70.0,
                    "professionalism": 85.0
                },
                "feedback": {
                    "strengths": ["Very clear slides structure", "Effective introduction summary"],
                    "weaknesses": ["Audience eye contact indicators were low", "Slide 4 was text-heavy"],
                    "suggestions": ["Reduce slide word count to maximum 30 words per slide", "Use visual charts instead of tables"],
                    "slide_improvements": ["Slide 4: Convert bullet list into a 3-column benefit grid."]
                }
            })
        elif "words_per_minute" in prompt_lower or "overall_speech_score" in prompt_lower:
            content = json.dumps({
                "scores": {
                    "pace_score": 85.0,
                    "pronunciation_score": 90.0,
                    "vocal_stability_score": 78.0,
                    "overall_speech_score": 84.0
                },
                "metrics": {
                    "words_per_minute": 135.0,
                    "pause_count": 4,
                    "filler_words_count": 3
                },
                "speech_tips": ["Incorporate deliberate pauses before key transitions.", "Maintain consistent projection volume."]
            })
        elif "executive_summary" in prompt_lower or "session_data" in prompt_lower:
            content = json.dumps({
                "summary": "The debate session was highly competitive, focusing on the economic structures of UBI. While the participant showed strong presentation organization, they exhibited circular reasoning when questioned about microeconomic costs.",
                "key_takeaways": [
                    "Solid presentation structure and clear visual guides.",
                    "Vocal pacing was stable at 135 WPM.",
                    "Logical fallacies (Ad Hominem) compromised the second-round rebuttal."
                ],
                "high_priority_actions": [
                    "Complete the 'Logical Reasoning' lesson on circular argumentation.",
                    "Review microeconomic tax offset research links."
                ]
            })
        elif "final_coaching_report" in prompt_lower or "metrics_data" in prompt_lower:
            content = json.dumps({
                "overall_evaluation": "The learner has made significant progress, increasing critical thinking and pacing scores by 15% over the past 3 sessions. Consistent practice will resolve their minor reasoning fallacies.",
                "strengths_summary": ["High vocal confidence and stability", "Clear structuring of affirmative claims"],
                "developmental_areas": ["Fallacy avoidance during cross-examination", "Statistical evidence specificity"],
                "recommended_milestones": ["Achieve an average logical consistency score of 85%", "Complete 5 debate rounds with 0 detected fallacies"]
            })
            
        return AIMessage(content=content)


def get_llm(temperature: float = 0.7) -> ChatOpenAI:
    """Returns a ChatOpenAI client if API keys are present,
    otherwise returns a MockLLM instance.
    """
    openai_key = os.getenv("OPENAI_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY")
    
    if openai_key:
        logger.info("Initializing ChatOpenAI with OpenAI API Key.")
        return ChatOpenAI(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            temperature=temperature,
            openai_api_key=openai_key
        )
    elif gemini_key:
        logger.info("Initializing ChatOpenAI with Gemini OpenAI-Compatible API Key.")
        return ChatOpenAI(
            model="gemini-1.5-flash",
            temperature=temperature,
            openai_api_key=gemini_key,
            openai_api_base="https://generativelanguage.googleapis.com/v1beta/openai"
        )
    else:
        logger.warning("No API Keys found (neither OPENAI_API_KEY nor GEMINI_API_KEY). Falling back to MockLLM.")
        return MockLLM()
