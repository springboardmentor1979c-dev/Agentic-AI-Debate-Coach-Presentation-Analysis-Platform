import re
import random
from typing import List, Dict, Any
from app.models.schemas_and_models import (
    ClaimItem, ArgumentAnalysisResponse,
    FallacyItem, FallacyCheckResponse,
    CounterargumentItem, CounterargumentResponse,
    PresentationSpeechResponse, FillerWordDetail,
    DebateTurnResponse, ScoreCalculationResponse
)

# ==================== 1. ARGUMENT ANALYSIS ENGINE ====================

def analyze_argument(text: str, context_topic: str = "General Debate") -> ArgumentAnalysisResponse:
    sentences = [s.strip() for s in re.split(r'[.!?]+', text) if len(s.strip()) > 8]
    if not sentences:
        sentences = [text]

    claims = []
    evidence_indicator_words = ["data", "study", "research", "percent", "%", "according to", "report", "statistics", "evidence", "proven", "survey", "shows that"]
    
    for idx, sentence in enumerate(sentences):
        has_evidence = any(word in sentence.lower() for word in evidence_indicator_words)
        
        # Calculate metric heuristics
        length_factor = min(1.0, len(sentence.split()) / 12.0)
        has_causal_word = any(w in sentence.lower() for w in ["because", "therefore", "thus", "consequently", "leads to", "due to"])
        
        strength = round(65.0 + (15.0 if has_evidence else 0.0) + (10.0 if has_causal_word else 0.0) + (10.0 * length_factor), 1)
        clarity = round(70.0 + random.uniform(5, 25), 1)
        
        claim_type = "Fact Claim" if has_evidence else ("Value Claim" if any(w in sentence.lower() for w in ["should", "must", "better", "wrong", "good", "immoral"]) else "Policy Claim")
        
        claims.append(ClaimItem(
            claim=sentence,
            type=claim_type,
            evidence_found=has_evidence,
            strength_score=min(99.0, strength),
            clarity_score=min(99.0, clarity)
        ))

    avg_evidence = sum(1 for c in claims if c.evidence_found) / max(1, len(claims))
    evidence_score = round(min(98.0, 55.0 + (avg_evidence * 40.0) + random.uniform(2, 5)), 1)
    reasoning_quality = round(min(96.0, 72.0 + (len(claims) * 3.5) + random.uniform(1, 8)), 1)
    clarity_score = round(sum(c.clarity_score for c in claims) / max(1, len(claims)), 1)
    relevance_score = round(84.0 + random.uniform(2, 12), 1)
    
    # Weighted persuasiveness
    persuasiveness_index = round(
        (reasoning_quality * 0.35) + (evidence_score * 0.30) + (clarity_score * 0.20) + (relevance_score * 0.15), 1
    )

    summary_eval = (
        f"The argument demonstrates strong foundational reasoning with {len(claims)} distinct claim(s). "
        f"Evidence strength is rated at {evidence_score}%. "
        f"{'Solid empirical indicators were detected.' if avg_evidence > 0.4 else 'Consider incorporating more specific empirical data or peer-reviewed citations to boost persuasiveness.'}"
    )

    return ArgumentAnalysisResponse(
        claims=claims,
        evidence_score=evidence_score,
        reasoning_quality=reasoning_quality,
        clarity_score=clarity_score,
        relevance_score=relevance_score,
        persuasiveness_index=persuasiveness_index,
        summary_evaluation=summary_eval
    )


# ==================== 2. LOGICAL FALLACY DETECTION ENGINE ====================

FALLACY_RULES = [
    {
        "type": "Ad Hominem",
        "patterns": [r"\b(idiot|stupid|ignorant|corrupt|fool|hypocrite|liar|dishonest|incompetent|naive)\b", r"you don't know what you're talking about", r"attack on (his|her|their) character"],
        "explanation": "Attacking the person making the argument rather than addressing the substance of their claim.",
        "correction": "Focus on analyzing the premises, data, and evidence presented rather than personal attributes.",
        "severity": "High"
    },
    {
        "type": "Straw Man",
        "patterns": [r"\bso you're saying\b", r"\bclaims that we should completely eliminate\b", r"\bexaggerat(es|ing)\b", r"misrepresent"],
        "explanation": "Distorting or oversimplifying an opponent's position to make it easier to attack.",
        "correction": "Restate your opponent's position accurately (steel-manning) before offering a counter-critique.",
        "severity": "High"
    },
    {
        "type": "False Dilemma",
        "patterns": [r"\beither we\b.*?\bor we\b", r"\bif we don't\b.*?\bwill be ruined\b", r"\bonly two choices\b", r"\bwith us or against us\b"],
        "explanation": "Presenting only two extreme choices when additional viable alternatives exist.",
        "correction": "Acknowledge nuanced middle-ground options or alternative policy frameworks.",
        "severity": "Medium"
    },
    {
        "type": "Slippery Slope",
        "patterns": [r"\bwill inevitably lead to\b", r"\bfirst step towards complete\b", r"\bwill spiral into\b", r"\bnext thing you know\b"],
        "explanation": "Assuming an initial action will trigger an uncontrollable chain reaction without proving causal links.",
        "correction": "Provide explicit step-by-step causal mechanisms proving why one event necessarily causes the next.",
        "severity": "Medium"
    },
    {
        "type": "Appeal to Authority",
        "patterns": [r"\bbecause expert[s]? say\b", r"\bfamous actor\b", r"\bcelebrity\b", r"\bjust because authority\b"],
        "explanation": "Claiming a statement must be true solely because an unqualified or unvetted authority figure asserted it.",
        "correction": "Cite peer-reviewed evidence, statistical data, or validated domain expertise rather than pure prestige.",
        "severity": "Low"
    },
    {
        "type": "Circular Reasoning",
        "patterns": [r"\bis true because it is\b", r"\bvalid because it\'s valid\b", r"\bself-evident\b", r"\bbecause I said so\b"],
        "explanation": "Begging the question by using the conclusion as one of the premises to support itself.",
        "correction": "Provide independent premises that support the conclusion without relying on the conclusion's truth.",
        "severity": "High"
    },
    {
        "type": "Hasty Generalization",
        "patterns": [r"\beveryone knows\b", r"\ball (politicians|people|scientists) are\b", r"\balways happen[s]?\b", r"\bnever works\b"],
        "explanation": "Drawing a broad universal conclusion based on a small or non-representative sample size.",
        "correction": "Qualify assertions using statistical ranges, probability markers, or representative dataset bounds.",
        "severity": "Medium"
    },
    {
        "type": "Red Herring",
        "patterns": [r"\bwhat about\b", r"\bwhy talk about that when\b", r"\bshifting the topic to\b", r"\bthe real issue is\b"],
        "explanation": "Introducing an irrelevant topic to divert attention away from the core argument under debate.",
        "correction": "Maintain strict thematic focus on the core motion or resolution being debated.",
        "severity": "Medium"
    }
]

def detect_fallacies(text: str) -> FallacyCheckResponse:
    detected_items = []
    lowered = text.lower()

    for rule in FALLACY_RULES:
        for pattern in rule["patterns"]:
            match = re.search(pattern, lowered, re.IGNORECASE)
            if match:
                phrase = match.group(0)
                # Find matching text snippet around match
                start_idx = max(0, text.lower().find(phrase) - 15)
                end_idx = min(len(text), text.lower().find(phrase) + len(phrase) + 25)
                snippet = f"\"{text[start_idx:end_idx].strip()}\""
                
                detected_items.append(FallacyItem(
                    fallacy_type=rule["type"],
                    detected_phrase=snippet,
                    explanation=rule["explanation"],
                    suggested_correction=rule["correction"],
                    severity=rule["severity"]
                ))
                break # Avoid duplicate hits for same rule

    total = len(detected_items)
    deduction = total * 12.0
    credibility_score = max(35.0, round(98.0 - deduction, 1))

    if total == 0:
        assessment = "Excellent logical hygiene! No major logical fallacies detected in this text."
    elif total <= 2:
        assessment = f"Detected {total} potential fallacy/fallacies. The core reasoning is mostly intact but reframing will increase credibility."
    else:
        assessment = f"High fallacy concentration detected ({total} fallacies). Restructure your argument to eliminate structural flaws and personal bias."

    return FallacyCheckResponse(
        fallacies_detected=detected_items,
        total_fallacies=total,
        credibility_score=credibility_score,
        overall_assessment=assessment
    )


# ==================== 3. COUNTERARGUMENT GENERATION ENGINE ====================

def generate_counterarguments(argument_text: str, topic: str, perspective: str = "All") -> CounterargumentResponse:
    counter_items = [
        CounterargumentItem(
            category="Logical",
            rebuttal=f"While the premises on '{topic}' appear cohesive initially, the assumed premise fails to account for secondary systemic variables.",
            key_counterpoint="The logical connection relies on an unstated assumption regarding resource availability.",
            challenge_question="What empirical guarantee is there that this causal link holds across fluctuating macro conditions?",
            debate_strategy="Expose the hidden assumption and present a counter-scenario where the logic breaks down."
        ),
        CounterargumentItem(
            category="Evidence-based",
            rebuttal=f"Empirical datasets regarding {topic} demonstrate significant variance when tested across longitudinal case studies.",
            key_counterpoint="Recent comparative studies indicate a counter-trend that contradicts short-term observations.",
            challenge_question="Can you cite peer-reviewed data controlling for selection bias in your primary supporting study?",
            debate_strategy="Introduce conflicting statistical evidence and question the sample size of the opponent's sources."
        ),
        CounterargumentItem(
            category="Ethical",
            rebuttal=f"From a deontological and distributive justice perspective, implementing this stance on {topic} creates inequitable burdens.",
            key_counterpoint="Minority populations or vulnerable stakeholders bear disproportionate downside risk under this framework.",
            challenge_question="How does this policy satisfy the ethical principle of proportional benefit and systemic fairness?",
            debate_strategy="Reframe the debate from purely utilitarian gains to fundamental rights and ethical duty."
        ),
        CounterargumentItem(
            category="Practical",
            rebuttal=f"Operationalizing this proposed solution for {topic} faces severe execution bottlenecks, high capital overhead, and bureaucratic friction.",
            key_counterpoint="Implementation failure rates remain high due to administrative complexity.",
            challenge_question="What is the concrete rollout timetable and enforcement budget required to sustain this policy?",
            debate_strategy="Focus on feasibility, resource constraints, friction, and unintended operational consequences."
        ),
        CounterargumentItem(
            category="Policy",
            rebuttal=f"Alternative regulatory frameworks—such as incentive-based structures—achieve superior outcomes without rigid legislative mandates.",
            key_counterpoint="Market-driven incentives and decentralized solutions offer higher flexibility than centralized policy.",
            challenge_question="Why favor a centralized mandate when a decentralized incentive model yields lower deadweight loss?",
            debate_strategy="Present a viable, superior alternative policy solution that solves the problem with fewer trade-offs."
        )
    ]

    if perspective != "All":
        counter_items = [item for item in counter_items if item.category.lower() == perspective.lower()]

    tips = [
        "Anticipate your opponent's primary value framework (e.g., Utilitarianism vs. Rights-based) before delivering rebuttals.",
        "Always structure your rebuttal using the 4-Step Method: 1. They Say, 2. But I Say, 3. Because, 4. Therefore.",
        "Pivot back to your core win condition immediately after dismantling an opposing claim."
    ]

    return CounterargumentResponse(
        counterarguments=counter_items,
        debate_tips=tips
    )


# ==================== 4. PRESENTATION & SPEECH ENGINE ====================

FILLER_WORDS_LIST = ["um", "uh", "like", "you know", "basically", "sort of", "i mean", "right", "actually", "literally"]

def analyze_speech(transcript: str, title: str = "Presentation Speech", domain: str = "Public Speaking", duration_seconds: float = 120.0) -> PresentationSpeechResponse:
    words = [w.strip(".,!?;:\"").lower() for w in transcript.split() if w.strip()]
    total_words = len(words)
    
    # Calculate WPM
    minutes = max(0.25, duration_seconds / 60.0)
    wpm = round(total_words / minutes, 1)

    if wpm < 110:
        pace_assessment = "Slightly Slow - Consider accelerating your delivery to maintain energy."
    elif 110 <= wpm <= 160:
        pace_assessment = "Optimal Delivery Speed - Excellent cadence for retention and clarity."
    elif 161 <= wpm <= 190:
        pace_assessment = "Brisk Pace - Ensure key points are punctuated with deliberate pauses."
    else:
        pace_assessment = "Too Fast - Rapid speech may diminish audience comprehension."

    # Filler word count
    filler_counts = {}
    total_fillers = 0
    
    for word in words:
        if word in FILLER_WORDS_LIST:
            filler_counts[word] = filler_counts.get(word, 0) + 1
            total_fillers += 1

    # Check two-word fillers like "you know" or "i mean"
    lowered_transcript = transcript.lower()
    for multi in ["you know", "i mean", "sort of"]:
        cnt = len(re.findall(r'\b' + re.escape(multi) + r'\b', lowered_transcript))
        if cnt > 0:
            filler_counts[multi] = cnt
            total_fillers += cnt

    filler_breakdown = [
        FillerWordDetail(
            word=w,
            count=c,
            occurrences=[f"Detected '{w}' in sentence delivery"]
        ) for w, c in filler_counts.items()
    ]

    # Scores calculation
    confidence_score = round(max(40.0, min(98.0, 92.0 - (total_fillers * 3.0) + (10.0 if 120 <= wpm <= 160 else 0.0))), 1)
    clarity_score = round(max(45.0, min(99.0, 88.0 - (total_fillers * 2.0) + random.uniform(2, 6))), 1)
    engagement_score = round(max(50.0, min(97.0, 84.0 + (10.0 if wpm > 120 else 0.0) + random.uniform(1, 8))), 1)
    overall_score = round((confidence_score * 0.35) + (clarity_score * 0.35) + (engagement_score * 0.30), 1)

    recommendations = [
        f"Your speaking pace of {wpm} WPM is classified as: {pace_assessment}.",
        f"Filler word density: {total_fillers} filler sound(s) detected across {total_words} words. Aim for micro-pauses instead of verbal fillers.",
        "Practice 'Power Pauses' before transitioning to key thesis slides to boost audience engagement scores."
    ]

    return PresentationSpeechResponse(
        title=title,
        duration_seconds=duration_seconds,
        words_per_minute=wpm,
        pace_assessment=pace_assessment,
        filler_word_count=total_fillers,
        filler_breakdown=filler_breakdown,
        confidence_score=confidence_score,
        clarity_score=clarity_score,
        engagement_score=engagement_score,
        overall_presentation_score=overall_score,
        key_recommendations=recommendations
    )


# ==================== 5. AI DEBATE SIMULATION ENGINE ====================

PERSONA_PROMPTS = {
    "Socratic Scholar": "I challenge your fundamental definitions. If we accept your proposition, how do you reconcile the inherent contradiction in your primary premise?",
    "Aggressive Pragmatist": "That theory sounds appealing in academic journals, but real-world execution metrics tell a completely different story. How do you address the immense economic cost?",
    "Policy Expert": "Under standard parliamentary procedure and statutory precedent, your proposed framework lacks statutory enforcement mechanisms and fiscal oversight.",
    "Philosophical Analyst": "You rely on a purely utilitarian calculus. But what about the deontological ethical rights that are violated in your model?"
}

def process_debate_turn(request) -> DebateTurnResponse:
    persona = request.opponent_persona if request.opponent_persona in PERSONA_PROMPTS else "Socratic Scholar"
    base_reply = PERSONA_PROMPTS[persona]
    
    # Fallacy check on turn
    fallacy_res = detect_fallacies(request.user_argument)
    
    opponent_response = (
        f"[{persona} Opponent]: {base_reply} "
        f"Regarding your point: '{request.user_argument[:80]}...', you claim this will solve the issue, "
        f"yet you haven't provided empirical backing for the key mechanism. I counter that our position provides a far more stable framework."
    )
    
    coaching_tips = [
        "Strengthen your next turn by introducing a empirical statistic or expert study.",
        "Acknowledge your opponent's objection directly before launching your counter-attack.",
        "Use structured signposting: 'First, on cost; Second, on equity; Third, on long-term impact.'"
    ]
    
    return DebateTurnResponse(
        opponent_response=opponent_response,
        detected_fallacies_in_user_turn=fallacy_res.fallacies_detected,
        live_coaching_tip=random.choice(coaching_tips),
        current_turn_score=round(78.0 + random.uniform(5, 18), 1),
        counterarguments_suggested=[
            "Point out that the opponent is over-focusing on extreme edge cases.",
            "Reframe the debate back to core human welfare impacts."
        ]
    )


# ==================== 6. WEIGHTED PERFORMANCE SCORING ENGINE ====================

def compute_performance_score(req) -> ScoreCalculationResponse:
    # 30% Arg Quality, 20% Evidence Usage, 20% Logical Consistency, 15% Rebuttal, 15% Communication
    overall = (
        (req.argument_quality * 0.30) +
        (req.evidence_usage * 0.20) +
        (req.logical_consistency * 0.20) +
        (req.rebuttal_effectiveness * 0.15) +
        (req.communication_skills * 0.15)
    )
    overall = round(overall, 1)

    if overall >= 90.0:
        tier = "Master Debater"
    elif overall >= 80.0:
        tier = "Proficient Debater"
    elif overall >= 70.0:
        tier = "Developing Speaker"
    else:
        tier = "Novice Practitioner"

    strengths = []
    if req.argument_quality >= 80: strengths.append("High Argument Quality & Claim Structure")
    if req.logical_consistency >= 80: strengths.append("Clean Logical Consistency & Hygiene")
    if req.communication_skills >= 80: strengths.append("Articulate Delivery & High Vocal Confidence")
    if not strengths: strengths.append("Solid foundations to build upon")

    growth = []
    if req.evidence_usage < 75: growth.append("Integrate more empirical data citations & research studies")
    if req.rebuttal_effectiveness < 75: growth.append("Sharpen 4-Step Rebuttal timing and direct refutations")
    if req.argument_quality < 75: growth.append("Avoid over-generalizing premises in core arguments")
    if not growth: growth.append("Maintain peak performance through advanced parliamentary format practice")

    return ScoreCalculationResponse(
        overall_score=overall,
        breakdown={
            "Argument Quality (30%)": round(req.argument_quality * 0.30, 1),
            "Evidence Usage (20%)": round(req.evidence_usage * 0.20, 1),
            "Logical Consistency (20%)": round(req.logical_consistency * 0.20, 1),
            "Rebuttal Effectiveness (15%)": round(req.rebuttal_effectiveness * 0.15, 1),
            "Communication Skills (15%)": round(req.communication_skills * 0.15, 1),
        },
        rating_tier=tier,
        strengths=strengths,
        growth_areas=growth
    )
