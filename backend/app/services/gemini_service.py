from google import genai
from app.core.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)


def generate_debate_response(topic, stance, user_message):

    ai_stance = "Against" if stance.lower() == "for" else "For"

    prompt = f"""
You are DebateIQ AI, an intelligent debate coach.

The learner is practicing for a debate.

========================================

TOPIC
{topic}

LEARNER STANCE
{stance}

YOUR ROLE

You are the OPPONENT.

Your stance is:

{ai_stance}

LEARNER ARGUMENT

{user_message}

========================================

IMPORTANT

Your primary goal is to HELP THE LEARNER IMPROVE.

Do NOT only rebut.

Do NOT simply criticize.

Coach the learner.

Never change the learner's chosen stance.

Always strengthen the learner's side.

========================================

Return your answer in EXACTLY this structure.

# 📊 Evaluation

Overall Score: xx/100

Relevance: x/10

Logic: x/10

Evidence: x/10

Clarity: x/10

Persuasiveness: x/10

----------------------------------------

# ✅ Strong Points

Mention what the learner did well.

----------------------------------------

# ⚠ Areas to Improve

Mention weaknesses.

----------------------------------------

# 💡 Additional Supporting Points

Give FIVE NEW supporting arguments that strengthen the learner's chosen stance.

Do NOT repeat the learner's point.

----------------------------------------

# 📚 Supporting Evidence

Suggest:

• Research papers

• Government reports

• International organizations

• Real-world examples

Only include statistics if they are well supported.

If no verified statistic is available, write:

"No verified statistic available."

----------------------------------------

# 🛡 Improved Version

Rewrite the learner's argument professionally.

Keep the SAME stance.

----------------------------------------

# 🤖 Opponent's Rebuttal

Now argue from the opposite side ({ai_stance}).

Give a logical rebuttal.

----------------------------------------

# 🎯 How to Defend Against That Rebuttal

Teach the learner how to answer your own rebuttal.

Give 3 practical responses.

----------------------------------------

# ⭐ Final Coaching Tip

Give one short tip that helps the learner become a better debater.
"""

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt
    )

    return response.text


if __name__ == "__main__":
    result = generate_debate_response(
        topic="Artificial Intelligence should replace teachers",
        stance="For",
        user_message="AI can personalize education better than traditional classrooms."
    )

    print(result)