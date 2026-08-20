# ============================================================
# LOCAL / MOCK AGENTIC AI ENGINE
# ============================================================

def argument_analysis_agent(topic, argument):
    """
    Agent 1: Analyzes the quality of the user's argument.
    """

    text = argument.lower()

    clarity = 75
    relevance = 75
    evidence = 60
    logical_consistency = 70
    persuasiveness = 70

    evidence_words = [
        "research",
        "study",
        "statistics",
        "data",
        "evidence",
        "report",
        "survey",
        "example"
    ]

    for word in evidence_words:
        if word in text:
            evidence += 5

    evidence = min(evidence, 100)

    if len(argument.split()) >= 30:
        clarity += 10
    elif len(argument.split()) >= 15:
        clarity += 5

    clarity = min(clarity, 100)

    if topic.lower() in text:
        relevance += 10

    relevance = min(relevance, 100)

    if (
        "because" in text
        or "therefore" in text
        or "however" in text
    ):
        logical_consistency += 10

    logical_consistency = min(logical_consistency, 100)

    persuasive_words = [
        "should",
        "must",
        "important",
        "necessary",
        "beneficial",
        "essential"
    ]

    for word in persuasive_words:
        if word in text:
            persuasiveness += 3

    persuasiveness = min(persuasiveness, 100)

    return {
        "clarity": clarity,
        "relevance": relevance,
        "evidence_strength": evidence,
        "logical_consistency": logical_consistency,
        "persuasiveness": persuasiveness
    }


def fallacy_detection_agent(argument):
    """
    Agent 2: Detects common logical fallacies.
    """

    text = argument.lower()

    fallacy = "None Detected"

    if "everyone" in text:
        fallacy = "Bandwagon Fallacy"

    elif "always" in text or "never" in text:
        fallacy = "Hasty Generalization"

    elif "idiot" in text or "stupid" in text:
        fallacy = "Ad Hominem"

    elif "if" in text and "then" in text:
        fallacy = "Slippery Slope"

    return {
        "fallacy": fallacy
    }


def counterargument_agent(topic, argument):
    """
    Agent 3: Generates an opposing viewpoint.
    """

    text = argument.lower()

    if "ai" in text:
        counterargument = (
            "AI can improve efficiency and personalization, but human "
            "judgment, empathy, creativity, and ethical decision-making "
            "remain important."
        )

    elif "education" in text:
        counterargument = (
            "Technology can improve learning, but teachers provide "
            "mentorship, emotional support, and human interaction."
        )

    elif "technology" in text:
        counterargument = (
            "Technology improves efficiency, but excessive dependence "
            "can create privacy, security, and social challenges."
        )

    else:
        counterargument = (
            "Consider the strongest opposing viewpoint and address it "
            "with evidence and logical reasoning."
        )

    return {
        "counterargument": counterargument
    }


def scoring_agent(argument_analysis):
    """
    Agent 4: Calculates the overall argument score.
    """

    clarity = argument_analysis["clarity"]
    relevance = argument_analysis["relevance"]
    evidence = argument_analysis["evidence_strength"]
    logical_consistency = argument_analysis["logical_consistency"]
    persuasiveness = argument_analysis["persuasiveness"]

    overall_score = round(
        (clarity * 0.20)
        + (relevance * 0.20)
        + (evidence * 0.20)
        + (logical_consistency * 0.20)
        + (persuasiveness * 0.20)
    )

    return {
        "overall_score": overall_score
    }


def coaching_agent(argument_analysis, fallacy_result):
    """
    Agent 5: Generates personalized coaching feedback.
    """

    recommendations = []

    if argument_analysis["evidence_strength"] < 70:
        recommendations.append(
            "Support your claims with research, statistics, "
            "or real-world examples."
        )

    if argument_analysis["logical_consistency"] < 80:
        recommendations.append(
            "Improve logical connections between your claims "
            "and supporting points."
        )

    if argument_analysis["clarity"] < 80:
        recommendations.append(
            "Make your argument more structured and concise."
        )

    if fallacy_result["fallacy"] != "None Detected":
        recommendations.append(
            f"Avoid {fallacy_result['fallacy']} by supporting "
            "claims with evidence and logical reasoning."
        )

    if not recommendations:
        recommendations.append(
            "Good performance. Practice stronger rebuttals "
            "and advanced evidence-based arguments."
        )

    return {
        "recommendations": recommendations,
        "coaching_hint": (
            "Address the strongest opposing point directly and "
            "support your response with reliable evidence."
        )
    }


def analyze_argument(topic, argument):
    """
    Main Agentic AI Pipeline.

    Coordinates multiple specialized agents:
    Argument Analysis → Fallacy Detection →
    Counterargument → Scoring → Coaching
    """

    argument_analysis = argument_analysis_agent(
        topic,
        argument
    )

    fallacy_result = fallacy_detection_agent(
        argument
    )

    counterargument_result = counterargument_agent(
        topic,
        argument
    )

    scoring_result = scoring_agent(
        argument_analysis
    )

    coaching_result = coaching_agent(
        argument_analysis,
        fallacy_result
    )

    return {
        "clarity": argument_analysis["clarity"],
        "relevance": argument_analysis["relevance"],
        "evidence_strength": argument_analysis["evidence_strength"],
        "logical_consistency": argument_analysis["logical_consistency"],
        "persuasiveness": argument_analysis["persuasiveness"],
        "overall_score": scoring_result["overall_score"],
        "fallacy": fallacy_result["fallacy"],
        "counterargument": counterargument_result["counterargument"],
        "recommendations": coaching_result["recommendations"],
        "coaching_hint": coaching_result["coaching_hint"]
    }


def generate_ai_response(topic, argument):
    """
    Generates the AI opponent response using the
    agentic analysis pipeline.
    """

    analysis = analyze_argument(
        topic,
        argument
    )

    return {
        "opponent_response": analysis["counterargument"],
        "challenge_question": (
            "What evidence or real-world example can you provide "
            "to defend your position?"
        ),
        "coaching_hint": analysis["coaching_hint"],
        "analysis": analysis
    }