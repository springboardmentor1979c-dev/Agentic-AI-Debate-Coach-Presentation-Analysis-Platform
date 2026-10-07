# Prompt Templates for Agentic AI Debate Coach

CLAIM_DETECTION = """
Analyze the following debate text or transcript and identify:
1. The Main Claim: The core assertion being made.
2. Supporting Claims: Secondary assertions that support the main claim.
3. Counter Claims: Potential or stated opposing claims addressed in the text.
For each claim, assign a confidence score between 0.0 and 1.0 based on how clearly it is articulated.

Respond in JSON format only with the following structure:
{
  "main_claim": {
    "text": "string",
    "confidence": float
  },
  "supporting_claims": [
    {
      "text": "string",
      "confidence": float
    }
  ],
  "counter_claims": [
    {
      "text": "string",
      "confidence": float
    }
  ]
}

Text to analyze:
{text}
"""

FALLACY_DETECTION = """
Analyze the following text and identify logical fallacies. Look for the following types:
- Ad Hominem
- Strawman
- False Dilemma
- Slippery Slope
- Appeal to Authority
- Circular Reasoning
- Hasty Generalization
- Red Herring

For each fallacy found, return:
1. Fallacy Name
2. Explanation of why it is a fallacy in this context
3. The exact sentence from the text containing the fallacy (highlighted sentence)
4. Severity: High, Medium, Low
5. Correction Suggestion: How to rephrase or correct the logic
6. An Example of the correct logical structure

Respond in JSON format only with the following structure:
{
  "fallacies": [
    {
      "fallacy_type": "string",
      "severity": "string",
      "description": "string",
      "correction": "string",
      "highlighted_sentence": "string",
      "example": "string"
    }
  ]
}

Text to analyze:
{text}
"""

REASONING_EVALUATION = """
Evaluate the reasoning quality of the following argument.
Analyze:
1. Logical Flow: Do premises lead logically to the conclusion?
2. Consistency: Are there any contradictions?
3. Validity: Is the reasoning valid?
4. Coherence: Is it easy to follow?
5. Reasoning Chain: Provide a step-by-step description of the reasoning chain.

Output an overall quality rating: Excellent, Good, Average, or Weak.

Respond in JSON format only with the following structure:
{
  "logical_flow": "string",
  "consistency": "string",
  "validity": "string",
  "coherence": "string",
  "reasoning_chain": ["string"],
  "overall_quality": "string"  // Excellent, Good, Average, or Weak
}

Text to analyze:
{text}
"""

FEEDBACK_GENERATION = """
Generate constructive feedback for the user based on their argument.
Provide:
1. Strengths: What was done well (clarity, logic, persuasiveness).
2. Weaknesses: Where the argument falls short.
3. Missing Evidence: What evidence or data points are missing that could support the claims.
4. Improvement Tips: Actionable suggestions for improvement.

Respond in JSON format only with the following structure:
{
  "strengths": ["string"],
  "weaknesses": ["string"],
  "missing_evidence": ["string"],
  "improvement_tips": ["string"]
}

Text to analyze:
{text}
"""

ARGUMENT_IMPROVEMENT = """
Rewrite the following weak argument to improve its logic, structure, grammar, persuasiveness, and evidence.
You MUST:
1. Retain the original meaning and core stance.
2. Provide a better structured version.
3. Fix any grammatical or logical errors.
4. Improve wording for persuasiveness.

Respond in JSON format only with the following structure:
{
  "improved_argument": "string",
  "wording_tips": "string",
  "structural_tips": "string"
}

Original Argument:
{text}
"""

DEBATE_OPENING = """
You are an AI debate opponent participating in a {format} debate on the topic: "{topic}".
Stance: {stance} (Affirmative or Negative)
AI Personality: {personality}
Difficulty Level: {difficulty}

Generate a compelling, professional opening statement for the debate. It should establish your core arguments and fit your personality.

Respond in JSON format only with the following structure:
{
  "opening_statement": "string",
  "key_points": ["string"]
}
"""

REBUTTAL_GENERATION = """
You are an AI debate opponent participating in a {format} debate on the topic: "{topic}".
Stance: {stance}
AI Personality: {personality}
Difficulty Level: {difficulty}

Analyze the user's latest argument and generate a rebuttal. Address their claims directly, expose weaknesses, and propose counter-arguments fitting your personality.
Keep the conversation context in mind:
{context}

Respond in JSON format only with the following structure:
{
  "rebuttal": "string",
  "points_addressed": ["string"]
}
"""

COUNTERARGUMENT_GENERATION = """
Generate specific counterarguments to the following user response.
Provide counterarguments from the following perspectives:
1. Logical (focus on logical reasoning errors)
2. Evidence-Based (focus on lack of data or counter-facts)
3. Ethical (focus on ethical/moral implications)
4. Economic (focus on cost/benefit, financial impacts)
5. Policy (focus on feasibility, rules, regulations)
6. Practical (focus on real-world implementation limits)
7. Philosophical (focus on values, ideology)

For each counterargument, provide:
1. Counterargument text
2. Explanation
3. Strength Score (0.0 to 100.0)
4. Possible User Reply (what the user could say next)

Respond in JSON format only with the following structure:
{
  "counterarguments": [
    {
      "counter_type": "string",  // logical, evidence_based, ethical, economic, policy, practical, philosophical
      "counter_argument": "string",
      "explanation": "string",
      "strength": float,
      "possible_user_reply": "string"
    }
  ]
}

User Argument:
{text}
"""

COACHING_FEEDBACK = """
You are an expert Debate Coach. Analyze the user's performance in the latest round of the debate.
Evaluate:
1. Confidence: Body language (if applicable), tone, and statement certainty.
2. Persuasiveness: Emotional appeal (pathos), rhetorical style.
3. Reasoning: Logical structure, consistency.
4. Logic: Fallacies avoided.
5. Evidence: Quality and specificity of supporting data.
6. Communication: Clarity, structure, articulation.

Suggest:
1. Better wording for their core points.
2. Missing evidence they could have cited.
3. Speaking advice.

Respond in JSON format only with the following structure:
{
  "scores": {
    "confidence": float,  // 0-100
    "persuasiveness": float,
    "reasoning": float,
    "logic": float,
    "evidence": float,
    "communication": float
  },
  "strengths": ["string"],
  "weaknesses": ["string"],
  "recommendations": ["string"],
  "better_wording": "string",
  "missing_evidence": ["string"],
  "speaking_advice": "string",
  "skill_focus": "string"
}

Debate Round Conversation:
{context}
"""

LEARNING_PLAN = """
Based on the user's weaknesses identified during their debate coaching session:
Weaknesses: {weaknesses}
Goal: {goal}
Difficulty: {difficulty}

Generate a personalized learning plan (for 7, 14, or 30 days as requested).
Provide:
1. Weekly breakdown (daily exercises).
2. Recommended exercises.

Respond in JSON format only with the following structure:
{
  "goal": "string",
  "difficulty": "string",
  "duration_days": int,
  "weekly_plan": [
    {
      "week": int,
      "focus": "string",
      "days": [
        {
          "day": int,
          "exercise": "string",
          "description": "string"
        }
      ]
    }
  ],
  "recommended_exercises": [
    {
      "name": "string",
      "exercise_type": "string",  // Research, Critical Thinking, Public Speaking, Logical Reasoning
      "instructions": "string"
    }
  ]
}
"""

PRESENTATION_EVALUATION = """
Evaluate this presentation transcript and slides context.
Analyze:
1. Communication Quality: Clarity, structural flow, transitions.
2. Confidence: Rhetorical strength, command of language.
3. Structure: Introduction, body, conclusion layout.
4. Audience Engagement: Hooks, interactive rhetoric, storytelling elements.
5. Professionalism: Style, tone, appropriateness.

Respond in JSON format only with the following structure:
{
  "scores": {
    "communication": float,  // 0-100
    "confidence": float,
    "structure": float,
    "engagement": float,
    "professionalism": float
  },
  "feedback": {
    "strengths": ["string"],
    "weaknesses": ["string"],
    "suggestions": ["string"],
    "slide_improvements": ["string"]
  }
}

Transcript:
{transcript}

Slides Info:
{slides}
"""

SPEECH_FEEDBACK = """
Based on audio features and transcript details, analyze the user's speech performance:
- Speech Pace (speaking speed)
- Pause Duration & Counts (average pause, long pauses)
- Filler Words Detected
- Pronunciation Consistency
- Voice Stability (pitch, volume consistency)

Provide detailed feedback and scoring.

Respond in JSON format only with the following structure:
{
  "scores": {
    "pace_score": float,  // 0-100
    "pronunciation_score": float,
    "vocal_stability_score": float,
    "overall_speech_score": float
  },
  "metrics": {
    "words_per_minute": float,
    "pause_count": int,
    "filler_words_count": int
  },
  "speech_tips": ["string"]
}

Vocal Analysis context:
{vocal_context}
"""

EXECUTIVE_SUMMARY = """
Create a comprehensive executive summary for the user's debate and presentation session.
Combine all scores, fallacies detected, speech metrics, video posture findings, and learning plan summaries into a highly professional executive brief.

Respond in JSON format only with the following structure:
{
  "summary": "string",
  "key_takeaways": ["string"],
  "high_priority_actions": ["string"]
}

Session Data:
{session_data}
"""

FINAL_COACHING_REPORT = """
Generate a final coaching report summarizing overall performance.
Provide a clear analysis of the growth timeline, skill progress, and recommendations.

Respond in JSON format only with the following structure:
{
  "overall_evaluation": "string",
  "strengths_summary": ["string"],
  "developmental_areas": ["string"],
  "recommended_milestones": ["string"]
}

Session Metrics:
{metrics_data}
"""
