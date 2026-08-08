"""Argument Analysis Engine and Logical Fallacy Detection Engine.

Provides detailed argument extraction, claim identification, evidence evaluation,
fallacy detection across 8 supported fallacies, reasoning quality analysis,
credibility assessment, and 5-criteria evaluation (Clarity, Relevance, Evidence Strength,
Logical Consistency, Persuasiveness).
"""

import re
from typing import Any, Dict, List, Tuple


class ArgumentAnalysisEngine:
    """Core analysis engine for speech transcripts and debate arguments."""

    SUPPORTED_FALLACIES = [
        "Ad Hominem",
        "Straw Man",
        "False Dilemma",
        "Slippery Slope",
        "Appeal to Authority",
        "Circular Reasoning",
        "Hasty Generalization",
        "Red Herring",
    ]

    def analyze(self, text: str, topic: str | None = None) -> Dict[str, Any]:
        """Perform comprehensive analysis on the provided speech text."""
        sentences = self._split_sentences(text)
        if not sentences:
            return self._empty_response(topic)

        # 1. Argument Extraction & Claim Identification
        extracted_components = self._extract_components(sentences)
        claims = self._identify_claims(sentences, topic)

        # 2. Evidence Evaluation
        evidence_eval = self._evaluate_evidence(sentences)

        # 3. Fallacy Detection Engine (8 Supported Fallacies)
        fallacies = self._detect_fallacies(sentences)

        # 4. Reasoning Quality Analysis
        reasoning = self._analyze_reasoning(sentences, fallacies, extracted_components)

        # 5. Credibility Assessment
        credibility = self._assess_credibility(evidence_eval, fallacies, len(sentences))

        # 6. Evaluation Criteria (0-100 each)
        scores = self._calculate_scores(
            text=text,
            sentences=sentences,
            claims=claims,
            evidence=evidence_eval,
            fallacies=fallacies,
            topic=topic,
            reasoning=reasoning,
        )

        # 7. Strengths, Weaknesses & Actionable Recommendations
        feedback = self._generate_feedback(scores, claims, fallacies, evidence_eval)

        criteria = {
            "clarity": scores["clarity"],
            "relevance": scores["relevance"],
            "evidence": scores["evidence_strength"],
            "logic": scores["logical_consistency"],
            "persuasiveness": scores["persuasiveness"],
        }
        source_credibility = {
            "credibility_score": credibility.get("score", 0),
            "credibility_level": credibility.get("level", "Medium"),
            "reason": credibility.get("reason", ""),
        }

        return {
            "topic": topic or "General Debate / Speech",
            "text_summary": {
                "word_count": len(text.split()),
                "sentence_count": len(sentences),
                "paragraph_count": max(1, text.count("\n\n") + 1),
            },
            "scores": scores,
            "overall_score": scores["overall_strength"],
            "criteria": criteria,
            "credibility": credibility,
            "source_credibility": source_credibility,
            "extracted_components": extracted_components,
            "claims": claims,
            "evidence_evaluation": evidence_eval,
            "fallacies": fallacies,
            "fallacies_detected": fallacies,
            "reasoning_analysis": reasoning,
            "feedback": feedback,
        }

    def _split_sentences(self, text: str) -> List[str]:
        raw = re.split(r"(?<=[.!?])\s+", text.strip())
        return [s.strip() for s in raw if s.strip() and len(s.strip()) > 3]

    def _empty_response(self, topic: str | None) -> Dict[str, Any]:
        return {
            "topic": topic or "General Debate / Speech",
            "text_summary": {"word_count": 0, "sentence_count": 0, "paragraph_count": 0},
            "scores": {
                "clarity": 0,
                "relevance": 0,
                "evidence_strength": 0,
                "logical_consistency": 0,
                "persuasiveness": 0,
                "overall_strength": 0,
            },
            "overall_score": 0,
            "criteria": {"clarity": 0, "relevance": 0, "evidence": 0, "logic": 0, "persuasiveness": 0},
            "credibility": {"level": "Low", "score": 0, "reason": "Empty text provided"},
            "source_credibility": {"credibility_score": 0, "credibility_level": "Low", "reason": "Empty text provided"},
            "extracted_components": {"premises": [], "evidence": [], "conclusions": [], "rebuttals": []},
            "claims": [],
            "evidence_evaluation": {"evidence_items": [], "density_score": 0, "grounding_level": "None"},
            "fallacies": [],
            "fallacies_detected": [],
            "reasoning_analysis": {"primary_mode": "Undefined", "coherence_score": 0, "flaws_found": []},
            "feedback": {"strengths": [], "weaknesses": ["No text provided"], "recommendations": ["Provide a detailed speech transcript."]},
        }

    def _extract_components(self, sentences: List[str]) -> Dict[str, List[str]]:
        premises, evidence, conclusions, rebuttals = [], [], [], []

        conclusion_markers = re.compile(r"\b(therefore|thus|consequently|in conclusion|hence|so|this proves that|we must conclude|as a result)\b", re.I)
        evidence_markers = re.compile(r"\b(for example|according to|data shows|research indicates|studies reveal|percent|%|statistics|study|found that|evidence suggests|survey|dr\.|professor)\b", re.I)
        rebuttal_markers = re.compile(r"\b(however|although|despite|opponents claim|on the contrary|even though|while critics argue|yet|nevertheless)\b", re.I)

        for s in sentences:
            if conclusion_markers.search(s):
                conclusions.append(s)
            elif evidence_markers.search(s):
                evidence.append(s)
            elif rebuttal_markers.search(s):
                rebuttals.append(s)
            else:
                premises.append(s)

        if not conclusions and sentences:
            conclusions.append(sentences[-1])

        return {
            "premises": premises,
            "evidence": evidence,
            "conclusions": conclusions,
            "rebuttals": rebuttals,
        }

    def _identify_claims(self, sentences: List[str], topic: str | None) -> List[Dict[str, Any]]:
        claims = []
        policy_keywords = re.compile(r"\b(should|must|ought to|need to|enact|ban|implement|require|pass|policy|prohibit)\b", re.I)
        value_keywords = re.compile(r"\b(good|bad|moral|immoral|better|worse|unjust|fair|harmful|beneficial|valuable|crucial|essential)\b", re.I)

        for idx, s in enumerate(sentences):
            is_claim_like = bool(
                re.search(r"\b(is|are|will|causes|leads to|results in|proves|shows|means that|clearly|undoubtedly|we believe|argues)\b", s, re.I)
            ) or idx == 0

            if is_claim_like:
                if policy_keywords.search(s):
                    claim_type = "Policy"
                    assumption = "Assumes that the proposed action will produce a preferable outcome over the status quo."
                elif value_keywords.search(s):
                    claim_type = "Value"
                    assumption = "Assumes a shared ethical framework or valuation priority."
                else:
                    claim_type = "Fact"
                    assumption = "Assumes underlying objective reality or empirical testability."

                claims.append({
                    "id": f"C{len(claims)+1}",
                    "statement": s,
                    "type": claim_type,
                    "is_main_thesis": idx == 0 or idx == len(sentences) - 1,
                    "implicit_assumption": assumption,
                })

        return claims[:5]

    def _evaluate_evidence(self, sentences: List[str]) -> Dict[str, Any]:
        evidence_items = []
        stat_regex = re.compile(r"(\d+(\.\d+)?%|\$\d+|\b\d+\s+(percent|people|million|billion|dollars|cases|studies)\b)", re.I)
        expert_regex = re.compile(r"\b(dr\.|doctor|professor|university|institute|journal|researchers|analysts|expert|report|nber|cdc|who|nasa)\b", re.I)
        anecdotal_regex = re.compile(r"\b(i remember|my friend|one time|in my experience|personally|i knew|last week|i saw)\b", re.I)
        empirical_regex = re.compile(r"\b(study|experiment|data|survey|investigation|trial|findings|measured|recorded)\b", re.I)

        for s in sentences:
            found_types = []
            specificity = "Low"
            credibility = "Moderate"

            if stat_regex.search(s):
                found_types.append("Statistical / Quantitative")
                specificity = "High"
                credibility = "High"
            if expert_regex.search(s):
                found_types.append("Expert Testimony / Citation")
                credibility = "High"
            if empirical_regex.search(s):
                found_types.append("Empirical Data")
                if specificity != "High":
                    specificity = "Medium"
            if anecdotal_regex.search(s):
                found_types.append("Anecdotal Evidence")
                credibility = "Low"

            if found_types:
                evidence_items.append({
                    "statement": s,
                    "evidence_types": found_types,
                    "specificity": specificity,
                    "estimated_credibility": credibility,
                })

        density = min(100, int((len(evidence_items) / max(1, len(sentences))) * 150))
        grounding = "Strong" if density >= 60 else ("Moderate" if density >= 30 else "Weak")

        return {
            "evidence_items": evidence_items,
            "density_score": density,
            "grounding_level": grounding,
            "count": len(evidence_items),
        }

    def _detect_fallacies(self, sentences: List[str]) -> List[Dict[str, Any]]:
        fallacies = []

        fallacy_patterns = [
            (
                "Ad Hominem",
                re.compile(r"\b(idiot|stupid|corrupt|fool|ignorant|liar|hypocrite|evil|selfish|greedy|incompetent|dumb|moron|loser|has no idea|cannot be trusted because he is|she is just a)\b", re.I),
                "Attacks the character, motive, or background of the opponent rather than addressing the substance of their argument.",
                "Focus directly on the opponent's premises, data, or logic rather than questioning their character or motives.",
            ),
            (
                "Straw Man",
                re.compile(r"\b(they want to destroy|wants to ruin|complete destruction|they claim that everyone|so you are saying we should just|wants us all to|they think nobody should|demands that all|total ban on everything)\b", re.I),
                "Misrepresents or exaggerates the opponent's position to make it easier to attack or refute.",
                "State the opponent's position accurately and in its strongest form (steelman) before offering counter-arguments.",
            ),
            (
                "False Dilemma",
                re.compile(r"\b(either we|or else|only two choices|you are either with us or|must choose between|no other option|if we don't .* then total|with us or against us)\b", re.I),
                "Presents only two extreme options as the sole possibilities, ignoring reasonable middle grounds or alternatives.",
                "Acknowledge the nuanced middle ground and evaluate compromise solutions or alternative options beyond binary extremes.",
            ),
            (
                "Slippery Slope",
                re.compile(r"\b(will inevitably lead to|inevitably cause|soon we will all|next thing you know|disaster will follow|will collapse society|eventually lead to total|lead straight to doom|open the floodgates to chaos)\b", re.I),
                "Assumes without sufficient evidence that a initial step will set off an uncontrollable chain reaction leading to catastrophic consequences.",
                "Provide empirical evidence or logical proof for each intermediate step in the causal sequence rather than jumping to extreme conclusions.",
            ),
            (
                "Appeal to Authority",
                re.compile(r"\b(famous celebrity said|trust me because|everyone knows that|celebrities agree|some people say|famous actor|unnamed experts say|authority figures agree|just believe me)\b", re.I),
                "Relies on the opinion of an unqualified, vague, or irrelevant authority figure rather than objective proof.",
                "Cite specific, domain-relevant experts, peer-reviewed literature, or verifiable empirical data.",
            ),
            (
                "Circular Reasoning",
                re.compile(r"\b(is true because it is|because it's the truth|valid because it is valid|obviously right because it is right|correct because it cannot be wrong|must be true because it says so)\b", re.I),
                "Begs the question by using the conclusion itself as one of the premises supporting the argument.",
                "Provide independent evidence or foundational premises that do not presuppose the truth of your conclusion.",
            ),
            (
                "Hasty Generalization",
                re.compile(r"\b(all of them|every single|never works|always happens|everyone knows|without exception|every time I saw|in all cases|nobody ever)\b", re.I),
                "Reaches a sweeping general conclusion based on an inadequate, biased, or tiny sample size.",
                "Qualify the claim (e.g., 'often', 'many cases') and back general statements with statistically representative data.",
            ),
            (
                "Red Herring",
                re.compile(r"\b(but what about|why talk about this when|far more important issue is|instead of focusing on|forget that for a moment|what about the scandal|ignore that and look at)\b", re.I),
                "Introduces an irrelevant side topic to divert attention away from the primary issue or argument.",
                "Stay directly focused on the core motion/question and address the immediate argument before introducing secondary topics.",
            ),
        ]

        for idx, sentence in enumerate(sentences):
            for name, pattern, explanation, suggestion in fallacy_patterns:
                match = pattern.search(sentence)
                if match:
                    fallacies.append({
                        "id": f"F{len(fallacies)+1}",
                        "fallacy_name": name,
                        "sentence_index": idx,
                        "excerpt": sentence,
                        "matched_trigger": match.group(0),
                        "explanation": explanation,
                        "correction_suggestion": suggestion,
                        "severity": "High" if name in ["Ad Hominem", "Straw Man", "Circular Reasoning"] else "Medium",
                    })

        return fallacies

    def _analyze_reasoning(
        self, sentences: List[str], fallacies: List[Dict[str, Any]], components: Dict[str, List[str]]
    ) -> Dict[str, Any]:
        causal_words = re.compile(r"\b(because|causes|leads to|results in|due to|therefore|since|consequently)\b", re.I)
        analogical_words = re.compile(r"\b(like|similar to|just as|compared to|analogy|resembles|as if)\b", re.I)
        inductive_words = re.compile(r"\b(for instance|for example|observed|data shows|samples|statistics|trends)\b", re.I)

        text_concat = " ".join(sentences)

        if causal_words.search(text_concat):
            primary_mode = "Causal Reasoning"
        elif inductive_words.search(text_concat):
            primary_mode = "Inductive Reasoning"
        elif analogical_words.search(text_concat):
            primary_mode = "Analogical Reasoning"
        else:
            primary_mode = "Deductive Reasoning"

        has_concl = len(components["conclusions"]) > 0
        has_prem = len(components["premises"]) > 0
        has_ev = len(components["evidence"]) > 0

        coherence = 100
        if not has_concl:
            coherence -= 20
        if not has_prem:
            coherence -= 20
        if not has_ev:
            coherence -= 15
        coherence -= len(fallacies) * 15
        coherence = max(10, min(100, coherence))

        flaws = [f["fallacy_name"] for f in fallacies]
        if not has_ev:
            flaws.append("Lack of Empirical Evidence Grounding")
        if not has_concl:
            flaws.append("Missing Explicit Conclusion")

        return {
            "primary_mode": primary_mode,
            "coherence_score": coherence,
            "has_premise_to_conclusion_flow": has_concl and has_prem,
            "flaws_found": list(set(flaws)),
        }

    def _assess_credibility(
        self, evidence_eval: Dict[str, Any], fallacies: List[Dict[str, Any]], sentence_count: int
    ) -> Dict[str, Any]:
        base_score = 70
        base_score += evidence_eval["count"] * 10
        base_score -= len(fallacies) * 18

        score = max(5, min(100, base_score))

        if score >= 75:
            level = "High"
            reason = "Argument relies heavily on verifiable data with minimal or no logical fallacies."
        elif score >= 45:
            level = "Medium"
            reason = "Argument has reasonable claims but contains unevidenced assertions or mild logical flaws."
        else:
            level = "Low"
            reason = "Argument contains significant logical fallacies, emotional attacks, or unverified claims."

        return {
            "score": score,
            "level": level,
            "reason": reason,
        }

    def _calculate_scores(
        self,
        text: str,
        sentences: List[str],
        claims: List[Dict[str, Any]],
        evidence: Dict[str, Any],
        fallacies: List[Dict[str, Any]],
        topic: str | None,
        reasoning: Dict[str, Any],
    ) -> Dict[str, int]:
        # 1. Clarity (0-100)
        avg_word_len = sum(len(s.split()) for s in sentences) / max(1, len(sentences))
        clarity = 85
        if avg_word_len > 35:
            clarity -= 15
        elif avg_word_len < 6:
            clarity -= 10
        if any(f["fallacy_name"] == "Circular Reasoning" for f in fallacies):
            clarity -= 15
        clarity = max(10, min(100, clarity))

        # 2. Relevance (0-100)
        relevance = 80
        if topic:
            topic_words = set(re.findall(r"\w+", topic.lower())) - {"the", "a", "an", "in", "of", "and", "or", "to", "for", "is", "should"}
            text_lower = text.lower()
            matches = sum(1 for w in topic_words if w in text_lower)
            if topic_words:
                rel_ratio = matches / len(topic_words)
                relevance = int(40 + rel_ratio * 60)
        if any(f["fallacy_name"] == "Red Herring" for f in fallacies):
            relevance -= 25
        relevance = max(10, min(100, relevance))

        # 3. Evidence Strength (0-100)
        evidence_strength = min(100, max(10, evidence["density_score"] + (evidence["count"] * 12)))
        if any(f["fallacy_name"] == "Appeal to Authority" for f in fallacies):
            evidence_strength -= 15

        # 4. Logical Consistency (0-100)
        logical_consistency = max(10, min(100, reasoning["coherence_score"]))

        # 5. Persuasiveness (0-100)
        persuasiveness = int(
            clarity * 0.20
            + relevance * 0.20
            + evidence_strength * 0.25
            + logical_consistency * 0.35
        )
        if any(f["fallacy_name"] == "Ad Hominem" for f in fallacies):
            persuasiveness -= 15
        persuasiveness = max(10, min(100, persuasiveness))

        overall = int(
            clarity * 0.15
            + relevance * 0.20
            + evidence_strength * 0.25
            + logical_consistency * 0.25
            + persuasiveness * 0.15
        )

        return {
            "clarity": clarity,
            "relevance": relevance,
            "evidence_strength": evidence_strength,
            "logical_consistency": logical_consistency,
            "persuasiveness": persuasiveness,
            "overall_strength": overall,
        }

    def _generate_feedback(
        self,
        scores: Dict[str, int],
        claims: List[Dict[str, Any]],
        fallacies: List[Dict[str, Any]],
        evidence: Dict[str, Any],
    ) -> Dict[str, List[str]]:
        strengths = []
        weaknesses = []
        recommendations = []

        if scores["clarity"] >= 75:
            strengths.append("Clear and well-structured sentence organization.")
        if scores["evidence_strength"] >= 70:
            strengths.append("Strong empirical and quantitative evidence backing main assertions.")
        if scores["logical_consistency"] >= 75:
            strengths.append("Coherent reasoning flow with minimal logical gaps.")
        if claims:
            strengths.append(f"Identified clear primary thesis and {len(claims)} key sub-claims.")

        if fallacies:
            weaknesses.append(f"Detected {len(fallacies)} logical fallacy/fallacies ({', '.join(set(f['fallacy_name'] for f in fallacies))}).")
        if evidence["count"] == 0:
            weaknesses.append("Lack of specific statistical data, expert citations, or verifiable evidence.")
        if scores["relevance"] < 60:
            weaknesses.append("Potential divergence from the primary motion or debate topic.")

        for f in fallacies:
            recommendations.append(f"Fix {f['fallacy_name']}: {f['correction_suggestion']}")
        if evidence["count"] == 0:
            recommendations.append("Incorporate specific empirical data, expert quotes, or statistical evidence to support your claims.")
        if scores["clarity"] < 70:
            recommendations.append("Simplify complex sentences and use explicit transition markers (e.g., 'Furthermore', 'Consequently').")

        if not strengths:
            strengths.append("Argument provides a foundational position for further development.")
        if not recommendations:
            recommendations.append("Maintain strong evidence grounding and continue refining rhetorical delivery.")

        return {
            "strengths": strengths,
            "weaknesses": weaknesses,
            "recommendations": recommendations,
        }
