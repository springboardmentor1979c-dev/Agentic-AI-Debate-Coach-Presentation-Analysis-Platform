import json
from typing import Dict, Any
from ai_providers import ai_provider

def analyze_argument(argument: str) -> Dict[str, Any]:
    prompt = f"""
    Analyze the following debate argument. Extrapolate claims, evaluate supporting evidence, analyze reasoning, and assess scores (0-10) for clarity, relevance, evidence strength, logical consistency, and persuasiveness.
    Provide strengths, weaknesses, and structural coaching feedback.
    
    Argument: "{argument}"
    
    Return EXACTLY a JSON object with this schema structure:
    {{
      "claims": ["list of key claims extracted"],
      "evidence": ["list of evidence points cited or referenced"],
      "reasoning_analysis": {{"validity": "description of reasoning soundness", "logic": "logical path explanation"}},
      "scores": {{
          "clarity": 0.0,
          "relevance": 0.0,
          "evidence_strength": 0.0,
          "logical_consistency": 0.0,
          "persuasiveness": 0.0
      }},
      "strengths": ["list of strengths"],
      "weaknesses": ["list of weaknesses"],
      "feedback": ["list of coaching recommendations"]
    }}
    """
    
    response = ai_provider.complete(prompt, system_prompt="You are an expert Debate Coach Argument Analyzer. You must output clean, valid JSON only.", json_mode=True)
    try:
        data = json.loads(response)
        # Validate schema structure
        required_keys = ["claims", "evidence", "reasoning_analysis", "scores", "strengths", "weaknesses", "feedback"]
        for key in required_keys:
            if key not in data:
                data[key] = [] if key != "reasoning_analysis" and key != "scores" else {}
        
        # Validate score weights & default structure
        score_keys = ["clarity", "relevance", "evidence_strength", "logical_consistency", "persuasiveness"]
        if "scores" not in data or not isinstance(data["scores"], dict):
            data["scores"] = {}
        for s_key in score_keys:
            if s_key not in data["scores"]:
                data["scores"][s_key] = 5.0
            else:
                data["scores"][s_key] = float(data["scores"][s_key])
                
        return data
    except Exception:
        # Structured fallback if JSON formatting is corrupt
        return {
            "claims": ["Argument statement"],
            "evidence": ["General explanation"],
            "reasoning_analysis": {"validity": "Unable to parse complete AI analysis", "logic": "Fallback default evaluation"},
            "scores": {
                "clarity": 5.0,
                "relevance": 5.0,
                "evidence_strength": 5.0,
                "logical_consistency": 5.0,
                "persuasiveness": 5.0
            },
            "strengths": ["Structured attempt"],
            "weaknesses": ["Analysis failed to generate clean schema response"],
            "feedback": ["Try expressing argument claims with clearer structural markers."]
        }
