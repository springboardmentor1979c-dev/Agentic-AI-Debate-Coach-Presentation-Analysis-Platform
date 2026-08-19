from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.gemini import generate_response
from app.routes.history import save_history

router = APIRouter(tags=["Debate"])


class DebateRequest(BaseModel):
    topic: str
    debate_format: str = "One-on-One"


class FeedbackRequest(BaseModel):
    topic: str
    ai_argument: str
    user_argument: str
    debate_format: str = "One-on-One"


class ContinueDebateRequest(BaseModel):
    topic: str
    debate_history: str
    user_argument: str
    debate_format: str = "One-on-One"


@router.post("/debate")
def debate(data: DebateRequest):
    prompt = f"""
You are Oratio AI, a professional debate opponent.

Topic:
{data.topic}

Debate Format:
{data.debate_format}

Generate a strong opening argument AGAINST the topic.

Adapt the argument to the selected debate format.

Requirements:
- 150 to 200 words
- persuasive
- logically structured
- suitable for the selected format
- clear reasoning
- no emojis
- no markdown
- no unnecessary introduction

Return only the opening argument.
"""

    try:
        response = generate_response(prompt)

        return {
            "response": response,
            "debate_format": data.debate_format,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.post("/debate/continue")
def continue_debate(data: ContinueDebateRequest):
    prompt = f"""
You are Oratio AI acting as an active debate opponent.

Topic:
{data.topic}

Debate Format:
{data.debate_format}

Previous Debate:
{data.debate_history}

User's Latest Argument:
{data.user_argument}

Respond to the user's latest argument.

Do all of the following:

1. Present a strong counterargument.
2. Challenge one weak point in the user's reasoning.
3. Introduce one relevant alternative perspective.
4. Ask ONE difficult follow-up question.
5. Keep the response between 120 and 180 words.

Return exactly:

COUNTERARGUMENT

Write the counterargument.

CHALLENGE

Identify the weakest point.

ALTERNATIVE PERSPECTIVE

Give another perspective.

FOLLOW-UP QUESTION

Ask one challenging question.

Rules:
- plain text only
- no emojis
- no markdown
- no asterisks
- no unnecessary introduction
"""

    try:
        response = generate_response(prompt)

        return {
            "response": response
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.post("/evaluate")
def evaluate(data: FeedbackRequest):
    prompt = f"""
You are Oratio AI, a professional debate analysis and coaching system.

Topic:
{data.topic}

Debate Format:
{data.debate_format}

AI Argument:
{data.ai_argument}

User Rebuttal:
{data.user_argument}

Evaluate the user's rebuttal according to the selected debate format.

Score:

Argument Quality
Evidence Usage
Logical Consistency
Rebuttal Effectiveness
Communication Skills
Clarity
Relevance
Persuasiveness
Confidence

Use this weighted performance model:

Argument Quality = 30%
Evidence Usage = 20%
Logical Consistency = 20%
Rebuttal Effectiveness = 15%
Communication Skills = 15%

Then analyze these fallacies:

Ad Hominem
Straw Man
False Dilemma
Slippery Slope
Appeal to Authority
Circular Reasoning
Hasty Generalization
Red Herring

Generate:
- Fallacy analysis
- Counterargument
- Challenge question
- Three strengths
- Three weaknesses
- Five coaching recommendations

Return exactly:

ORATIO AI DEBATE EVALUATION

WEIGHTED PERFORMANCE SCORE
__/100

ARGUMENT QUALITY
__/100

EVIDENCE USAGE
__/100

LOGICAL CONSISTENCY
__/100

REBUTTAL EFFECTIVENESS
__/100

COMMUNICATION SKILLS
__/100

CLARITY
__/100

RELEVANCE
__/100

PERSUASIVENESS
__/100

CONFIDENCE
__/100

LOGICAL FALLACY ANALYSIS

Fallacy:
Why it is present:
How to correct it:

COUNTERARGUMENT

...

CHALLENGE QUESTION

...

STRENGTHS

1.
2.
3.

AREAS FOR IMPROVEMENT

1.
2.
3.

COACHING RECOMMENDATIONS

1.
2.
3.
4.
5.

COACHING SUMMARY

...

Rules:
- plain text only
- no emojis
- no markdown
- no asterisks
- always provide every section
"""

    try:
        feedback = generate_response(prompt)

        save_history({
            "topic": data.topic,
            "ai_argument": data.ai_argument,
            "user_argument": data.user_argument,
            "feedback": feedback,
            "debate_format": data.debate_format,
        })

        return {
            "feedback": feedback
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )