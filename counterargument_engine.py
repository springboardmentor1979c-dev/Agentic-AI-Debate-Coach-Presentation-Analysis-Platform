"""Counterargument Generation Engine.

Generates rebuttals, counterpoints, alternative perspectives, challenge questions,
and debate strategy suggestions across five counterargument types:
Logical, Evidence-Based, Ethical, Practical, and Policy.
"""

import re
from typing import Any, Dict, List


class CounterargumentEngine:
    """Generates structured counterarguments for debate arguments and claims."""

    COUNTERARGUMENT_TYPES = [
        "Logical Rebuttals",
        "Evidence-Based Rebuttals",
        "Ethical Counterarguments",
        "Practical Counterarguments",
        "Policy Counterarguments",
    ]

    # ---------------------------------------------------------------------------
    #  Public API
    # ---------------------------------------------------------------------------

    def generate(self, argument_text: str, topic: str | None = None, position: str | None = None) -> Dict[str, Any]:
        """Analyse *argument_text* and return a full counterargument report."""
        sentences = self._split_sentences(argument_text)
        if not sentences:
            return self._empty_response(topic, position)

        claims = self._extract_claims(sentences)
        evidence_refs = self._extract_evidence_refs(sentences)

        # Core outputs ---
        rebuttals = self._generate_rebuttals(claims, sentences, topic)
        counterpoints = self._generate_counterpoints(claims, topic, position)
        alt_perspectives = self._generate_alternative_perspectives(claims, topic)
        challenge_questions = self._generate_challenge_questions(claims, evidence_refs, topic)
        strategy = self._generate_debate_strategy(claims, sentences, topic, position)

        # Typed counterarguments ---
        typed = self._generate_typed_counterarguments(claims, sentences, topic, position)

        # Strength score for the counter-case as a whole
        strength = self._score_counter_strength(rebuttals, counterpoints, typed)

        return {
            "topic": topic or "General Debate / Speech",
            "opposing_position": position or "Opposing Side",
            "summary": {
                "claims_addressed": len(claims),
                "rebuttals_generated": len(rebuttals),
                "counterpoints_generated": len(counterpoints),
                "challenge_questions_generated": len(challenge_questions),
                "strategies_suggested": len(strategy),
                "counter_strength_score": strength,
            },
            "claims_identified": claims,
            "rebuttals": rebuttals,
            "counterpoints": counterpoints,
            "alternative_perspectives": alt_perspectives,
            "challenge_questions": challenge_questions,
            "debate_strategy": strategy,
            "typed_counterarguments": typed,
            "counterargument_types": typed,
        }

    # ---------------------------------------------------------------------------
    #  Text helpers
    # ---------------------------------------------------------------------------

    def _split_sentences(self, text: str) -> List[str]:
        raw = re.split(r"(?<=[.!?])\s+", text.strip())
        return [s.strip() for s in raw if s.strip() and len(s.strip()) > 3]

    def _extract_claims(self, sentences: List[str]) -> List[Dict[str, Any]]:
        claims: List[Dict[str, Any]] = []
        claim_markers = re.compile(
            r"\b(is|are|will|causes|leads to|results in|proves|shows|means that|"
            r"clearly|undoubtedly|we believe|should|must|ought to|need to)\b", re.I,
        )
        for idx, s in enumerate(sentences):
            if claim_markers.search(s) or idx == 0:
                claims.append({"id": f"C{len(claims)+1}", "statement": s, "index": idx})
        return claims[:8]

    def _extract_evidence_refs(self, sentences: List[str]) -> List[str]:
        evidence_regex = re.compile(
            r"\b(study|data|research|statistics|percent|%|survey|dr\.|professor|"
            r"according to|report|experiment|findings|journal)\b", re.I,
        )
        return [s for s in sentences if evidence_regex.search(s)]

    # ---------------------------------------------------------------------------
    #  1. Rebuttal Generation
    # ---------------------------------------------------------------------------

    def _generate_rebuttals(self, claims: List[Dict], sentences: List[str], topic: str | None) -> List[Dict[str, Any]]:
        rebuttals: List[Dict[str, Any]] = []
        templates = self._rebuttal_templates()

        for claim in claims:
            stmt = claim["statement"]
            rebuttal_set: List[Dict[str, str]] = []

            # Pick templates based on claim content
            if re.search(r"\b(causes|leads to|results in)\b", stmt, re.I):
                rebuttal_set.append({
                    "type": "Causal Challenge",
                    "rebuttal": f"The claim that '{self._shorten(stmt)}' assumes a direct causal link, but correlation does not imply causation. Alternative factors may better explain the observed outcome.",
                })
            if re.search(r"\b(all|every|always|never|nobody|everyone)\b", stmt, re.I):
                rebuttal_set.append({
                    "type": "Overgeneralization Challenge",
                    "rebuttal": f"The sweeping assertion '{self._shorten(stmt)}' ignores significant exceptions. A more nuanced position would acknowledge the diversity of outcomes across different contexts.",
                })
            if re.search(r"\b(should|must|ought to|need to)\b", stmt, re.I):
                rebuttal_set.append({
                    "type": "Normative Challenge",
                    "rebuttal": f"While the proposition urges action ('{self._shorten(stmt)}'), it fails to demonstrate that the proposed course is superior to maintaining the status quo or pursuing less disruptive alternatives.",
                })
            if re.search(r"\b(data|study|research|percent|%|statistics)\b", stmt, re.I):
                rebuttal_set.append({
                    "type": "Methodological Challenge",
                    "rebuttal": f"The evidence cited ('{self._shorten(stmt)}') may suffer from selection bias, outdated methodology, or a narrow sample that limits its generalizability.",
                })

            # Fallback generic rebuttal
            if not rebuttal_set:
                rebuttal_set.append({
                    "type": "General Rebuttal",
                    "rebuttal": f"The assertion '{self._shorten(stmt)}' rests on unexamined assumptions that, once scrutinised, weaken the overall argument considerably.",
                })

            rebuttals.append({
                "claim_id": claim["id"],
                "original_claim": stmt,
                "rebuttals": rebuttal_set,
            })

        return rebuttals

    # ---------------------------------------------------------------------------
    #  2. Counterpoint Creation
    # ---------------------------------------------------------------------------

    def _generate_counterpoints(self, claims: List[Dict], topic: str | None, position: str | None) -> List[Dict[str, Any]]:
        counterpoints: List[Dict[str, Any]] = []
        topic_label = topic or "this issue"

        for claim in claims:
            stmt = claim["statement"]
            points: List[str] = []

            points.append(
                f"Even if '{self._shorten(stmt)}' is partially true, it overlooks the broader context of {topic_label} "
                f"where competing priorities must also be weighed."
            )

            if re.search(r"\b(benefit|advantage|improve|better)\b", stmt, re.I):
                points.append(
                    f"The alleged benefits may be short-term; long-term consequences such as unintended externalities "
                    f"or opportunity costs have not been addressed."
                )
            if re.search(r"\b(harm|danger|risk|threat)\b", stmt, re.I):
                points.append(
                    f"The risks described may be overstated or manageable through proper safeguards, "
                    f"regulation, or incremental implementation rather than outright prohibition."
                )

            points.append(
                f"An opposing interpretation of the same facts could equally support a different conclusion "
                f"regarding {topic_label}."
            )

            counterpoints.append({
                "claim_id": claim["id"],
                "original_claim": stmt,
                "counterpoints": points,
            })

        return counterpoints

    # ---------------------------------------------------------------------------
    #  3. Alternative Perspective Generation
    # ---------------------------------------------------------------------------

    def _generate_alternative_perspectives(self, claims: List[Dict], topic: str | None) -> List[Dict[str, Any]]:
        topic_label = topic or "this matter"
        perspectives = [
            {
                "lens": "Economic Perspective",
                "perspective": f"From a purely economic standpoint, {topic_label} should be evaluated through cost-benefit analysis, "
                               f"market efficiency, and resource allocation rather than ideological commitment.",
            },
            {
                "lens": "Social Equity Perspective",
                "perspective": f"Regarding {topic_label}, we must ask who benefits and who bears the cost. "
                               f"Marginalised communities often face disproportionate impact from well-intentioned policies.",
            },
            {
                "lens": "Historical Perspective",
                "perspective": f"History offers numerous precedents where similar positions on {topic_label} produced "
                               f"unforeseen consequences. Learning from past failures is essential before adopting sweeping changes.",
            },
            {
                "lens": "Scientific / Empirical Perspective",
                "perspective": f"A strictly evidence-based view of {topic_label} demands peer-reviewed data and replicable studies "
                               f"rather than anecdotal claims or appeals to authority.",
            },
            {
                "lens": "Global / Comparative Perspective",
                "perspective": f"Other nations and cultures approach {topic_label} differently, and comparative analysis "
                               f"reveals that the proposed stance is far from the only viable path.",
            },
        ]
        return perspectives

    # ---------------------------------------------------------------------------
    #  4. Challenge Question Generation
    # ---------------------------------------------------------------------------

    def _generate_challenge_questions(self, claims: List[Dict], evidence_refs: List[str], topic: str | None) -> List[Dict[str, Any]]:
        questions: List[Dict[str, Any]] = []
        topic_label = topic or "this topic"

        for claim in claims:
            stmt = claim["statement"]
            q_set: List[str] = []

            q_set.append(f"What specific, verifiable evidence supports the assertion that '{self._shorten(stmt)}'?")

            if re.search(r"\b(causes|leads to|results in)\b", stmt, re.I):
                q_set.append("Have you ruled out confounding variables or reverse causation in this causal chain?")
            if re.search(r"\b(should|must|ought to)\b", stmt, re.I):
                q_set.append("What are the trade-offs, and why are they acceptable compared to alternative courses of action?")
            if re.search(r"\b(all|every|always|never)\b", stmt, re.I):
                q_set.append("Can you name specific counter-examples that break this universal claim?")

            q_set.append(f"How would your position change if key assumptions about {topic_label} turned out to be false?")

            questions.append({
                "claim_id": claim["id"],
                "original_claim": stmt,
                "questions": q_set,
            })

        # Global-level questions
        questions.append({
            "claim_id": "GLOBAL",
            "original_claim": "Overall argument",
            "questions": [
                f"What is the strongest possible objection to your entire case on {topic_label}?",
                "If your opponent had unlimited evidence, which part of your argument would collapse first?",
                "Is there a compromise position that captures the merits of both sides?",
            ],
        })
        return questions

    # ---------------------------------------------------------------------------
    #  5. Debate Strategy Suggestions
    # ---------------------------------------------------------------------------

    def _generate_debate_strategy(self, claims: List[Dict], sentences: List[str], topic: str | None, position: str | None) -> List[Dict[str, Any]]:
        strategies: List[Dict[str, Any]] = []
        has_evidence = any(re.search(r"\b(data|study|percent|%|research)\b", s, re.I) for s in sentences)
        has_emotion = any(re.search(r"\b(feel|believe|heart|passion|children|families|suffering)\b", s, re.I) for s in sentences)
        has_policy = any(re.search(r"\b(should|must|ban|implement|enact|policy)\b", s, re.I) for s in sentences)

        strategies.append({
            "strategy": "Expose Assumptions",
            "description": "Identify the implicit assumptions underpinning the opponent's key claims and challenge each one individually. "
                           "Ask them to prove their foundational premises before allowing the argument to advance.",
            "priority": "High",
        })

        if has_evidence:
            strategies.append({
                "strategy": "Challenge Source Credibility",
                "description": "The opponent relies on cited data. Scrutinise the source's methodology, sample size, recency, "
                               "and potential conflicts of interest. Demand peer-reviewed corroboration.",
                "priority": "High",
            })
        else:
            strategies.append({
                "strategy": "Demand Empirical Grounding",
                "description": "The opponent's argument lacks concrete data. Press for specific statistics, studies, or documented "
                               "real-world examples. Highlight the absence of evidence as a fundamental weakness.",
                "priority": "High",
            })

        if has_emotion:
            strategies.append({
                "strategy": "Redirect Emotional Appeals to Logic",
                "description": "The opponent uses emotional language. Acknowledge the human element respectfully, then pivot "
                               "back to logical analysis and data-driven reasoning.",
                "priority": "Medium",
            })

        if has_policy:
            strategies.append({
                "strategy": "Present Superior Alternatives",
                "description": "Rather than merely opposing the proposed action, offer a concrete alternative policy or "
                               "graduated approach that addresses the same concern with fewer downsides.",
                "priority": "High",
            })

        strategies.append({
            "strategy": "Concede and Pivot",
            "description": "Strategically concede a minor point to build credibility, then redirect focus to a stronger "
                           "counterargument that undermines the opponent's central thesis.",
            "priority": "Medium",
        })

        strategies.append({
            "strategy": "Reframe the Debate",
            "description": "Shift the evaluative framework. If the opponent argues on economic grounds, reframe the "
                           "discussion around ethical, social, or long-term sustainability considerations.",
            "priority": "Medium",
        })

        return strategies

    # ---------------------------------------------------------------------------
    #  6. Typed Counterarguments (5 categories)
    # ---------------------------------------------------------------------------

    def _generate_typed_counterarguments(self, claims: List[Dict], sentences: List[str], topic: str | None, position: str | None) -> Dict[str, List[Dict[str, str]]]:
        topic_label = topic or "the topic at hand"
        primary_claim = claims[0]["statement"] if claims else "the central argument"

        typed: Dict[str, List[Dict[str, str]]] = {}

        # 1. Logical Rebuttals
        typed["Logical Rebuttals"] = [
            {
                "title": "Hidden Premise Exposure",
                "argument": f"The argument assumes that '{self._shorten(primary_claim)}' follows necessarily from the stated premises. "
                            f"However, the logical chain contains at least one unstated assumption that, if false, invalidates the conclusion.",
            },
            {
                "title": "False Dichotomy Rebuttal",
                "argument": f"The framing around {topic_label} presents a binary choice, but multiple intermediate positions exist "
                            f"that satisfy the core concern without the costs of the extreme proposal.",
            },
            {
                "title": "Inconsistency Highlight",
                "argument": f"If we accept the reasoning pattern used here, we must also accept absurd conclusions in analogous domains, "
                            f"revealing an internal inconsistency in the opponent's logical framework.",
            },
        ]

        # 2. Evidence-Based Rebuttals
        typed["Evidence-Based Rebuttals"] = [
            {
                "title": "Contradictory Data",
                "argument": f"Recent peer-reviewed studies present data that directly contradicts the claims made about {topic_label}. "
                            f"The opponent must reconcile their position with this conflicting body of evidence.",
            },
            {
                "title": "Sample & Methodology Critique",
                "argument": f"The evidence cited in support of '{self._shorten(primary_claim)}' relies on a narrow sample, "
                            f"outdated data, or a flawed methodology that limits its applicability to the current debate.",
            },
            {
                "title": "Missing Control Group",
                "argument": f"No adequate comparison baseline has been provided. Without a control scenario, the claimed effect "
                            f"of {topic_label} cannot be attributed with confidence.",
            },
        ]

        # 3. Ethical Counterarguments
        typed["Ethical Counterarguments"] = [
            {
                "title": "Rights-Based Objection",
                "argument": f"The proposal regarding {topic_label} infringes on fundamental individual rights or civil liberties "
                            f"that should not be sacrificed even for aggregate utilitarian gains.",
            },
            {
                "title": "Distributive Justice Concern",
                "argument": f"While the policy may produce net benefits, those benefits accrue disproportionately to privileged groups, "
                            f"while the costs fall on vulnerable populations — an ethically indefensible distribution.",
            },
            {
                "title": "Moral Precedent Warning",
                "argument": f"Accepting this argument on {topic_label} sets a moral precedent that could be extended to justify "
                            f"increasingly extreme actions in the future.",
            },
        ]

        # 4. Practical Counterarguments
        typed["Practical Counterarguments"] = [
            {
                "title": "Implementation Infeasibility",
                "argument": f"Even if the argument for {topic_label} is theoretically sound, real-world constraints — limited budgets, "
                            f"institutional inertia, and enforcement challenges — render its implementation impractical.",
            },
            {
                "title": "Unintended Consequences",
                "argument": f"Historical precedent demonstrates that similar interventions produce unintended side-effects "
                            f"that often outweigh the original intended benefit.",
            },
            {
                "title": "Opportunity Cost",
                "argument": f"Resources directed toward implementing this proposal on {topic_label} could be more effectively "
                            f"deployed on alternative solutions with a higher probability of success.",
            },
        ]

        # 5. Policy Counterarguments
        typed["Policy Counterarguments"] = [
            {
                "title": "Regulatory Overreach",
                "argument": f"The proposed policy on {topic_label} exceeds the appropriate scope of government intervention "
                            f"and could stifle innovation, market competition, or individual autonomy.",
            },
            {
                "title": "Incremental Alternative",
                "argument": f"A phased, incremental approach would achieve similar objectives with lower risk and greater "
                            f"flexibility to adjust based on observed outcomes.",
            },
            {
                "title": "Comparative Policy Failure",
                "argument": f"Jurisdictions that have adopted similar policies on {topic_label} have experienced poor outcomes, "
                            f"providing a natural experiment against the proposal.",
            },
        ]

        return typed

    # ---------------------------------------------------------------------------
    #  Scoring
    # ---------------------------------------------------------------------------

    def _score_counter_strength(self, rebuttals: List, counterpoints: List, typed: Dict) -> int:
        score = 40  # baseline
        score += min(20, len(rebuttals) * 5)
        score += min(15, len(counterpoints) * 4)
        score += min(25, sum(len(v) for v in typed.values()) * 2)
        return max(10, min(100, score))

    # ---------------------------------------------------------------------------
    #  Utilities
    # ---------------------------------------------------------------------------

    def _shorten(self, text: str, limit: int = 80) -> str:
        return text[:limit].rstrip() + ("…" if len(text) > limit else "")

    def _rebuttal_templates(self) -> List[str]:
        return [
            "This claim rests on an unproven causal link.",
            "The evidence base is too narrow to support such a broad conclusion.",
            "Alternative explanations have not been adequately ruled out.",
            "The normative leap from 'is' to 'ought' requires further justification.",
        ]

    def _empty_response(self, topic: str | None, position: str | None) -> Dict[str, Any]:
        return {
            "topic": topic or "General Debate / Speech",
            "opposing_position": position or "Opposing Side",
            "summary": {
                "claims_addressed": 0,
                "rebuttals_generated": 0,
                "counterpoints_generated": 0,
                "challenge_questions_generated": 0,
                "strategies_suggested": 0,
                "counter_strength_score": 0,
            },
            "claims_identified": [],
            "rebuttals": [],
            "counterpoints": [],
            "alternative_perspectives": [],
            "challenge_questions": [],
            "debate_strategy": [],
            "typed_counterarguments": {t: [] for t in self.COUNTERARGUMENT_TYPES},
        }
