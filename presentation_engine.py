"""Presentation Analysis Engine.

Provides detailed speech analysis, speaking pace evaluation, filler word detection,
confidence scoring, clarity assessment, and audience engagement measurement.
"""

import re
from typing import Any, Dict, List, Tuple


class PresentationAnalysisEngine:
    """Core analysis engine for presentations, speeches, and public speaking transcripts."""

    FILLER_WORDS = [
        "um",
        "uh",
        "er",
        "ah",
        "like",
        "you know",
        "basically",
        "actually",
        "literally",
        "honestly",
        "so",
        "i mean",
        "kind of",
        "sort of",
        "right",
        "anyway",
        "at the end of the day",
    ]

    STRONG_ASSERTIONS = [
        "definitely",
        "clearly",
        "certainly",
        "must",
        "will",
        "proven",
        "undoubtedly",
        "always",
        "strongly",
        "crucial",
        "essential",
        "vital",
        "guarantee",
        "convinced",
        "absolute",
        "unquestionably",
    ]

    HEDGE_WORDS = [
        "maybe",
        "kind of",
        "sort of",
        "i guess",
        "i think",
        "probably",
        "possibly",
        "attempt to",
        "somewhat",
        "fairly",
        "hope to",
        "might",
        "could perhaps",
        "not sure",
        "seems like",
    ]

    TRANSITION_WORDS = [
        "firstly",
        "secondly",
        "furthermore",
        "moreover",
        "however",
        "therefore",
        "in conclusion",
        "for example",
        "specifically",
        "on the other hand",
        "as a result",
        "in contrast",
        "subsequently",
    ]

    AUDIENCE_HOOKS = [
        "you",
        "your",
        "we",
        "our",
        "us",
        "together",
        "imagine",
        "picture this",
        "let's",
        "consider",
        "think about",
        "have you ever",
    ]

    CTA_PHRASES = [
        "must act",
        "join us",
        "start today",
        "i urge you",
        "let us",
        "take action",
        "remember",
        "call to action",
        "now is the time",
        "we need to",
        "i challenge you",
    ]

    def analyze(
        self,
        text: str,
        duration_seconds: float | None = None,
        title: str | None = None,
    ) -> Dict[str, Any]:
        """Perform comprehensive presentation analysis on the provided speech text."""
        cleaned_text = (text or "").strip()
        if not cleaned_text:
            return self._empty_response(title)

        words = self._extract_words(cleaned_text)
        sentences = self._split_sentences(cleaned_text)
        word_count = len(words)
        sentence_count = max(1, len(sentences))

        # 1. Speech Analysis
        speech_metrics = self._analyze_speech(words, sentences)

        # 2. Speaking Pace Evaluation
        pace_eval = self._evaluate_speaking_pace(word_count, duration_seconds)

        # 3. Filler Word Usage
        filler_eval = self._detect_filler_words(cleaned_text, words)

        # 4. Confidence Assessment
        confidence_eval = self._assess_confidence(cleaned_text, words)

        # 5. Clarity Assessment
        clarity_eval = self._assess_clarity(cleaned_text, words, sentences)

        # 6. Audience Engagement Measurement
        engagement_eval = self._measure_engagement(cleaned_text, words, sentences)

        # 7. Overall Presentation Score (0-100)
        scores = self._calculate_scores(
            pace_eval=pace_eval,
            filler_eval=filler_eval,
            confidence_eval=confidence_eval,
            clarity_eval=clarity_eval,
            engagement_eval=engagement_eval,
        )

        # 8. Actionable Recommendations
        recommendations = self._generate_recommendations(
            pace_eval, filler_eval, confidence_eval, clarity_eval, engagement_eval, scores
        )

        return {
            "title": title or "Presentation Analysis",
            "speech_text": cleaned_text,
            "duration_seconds": duration_seconds,
            "overall_score": scores["overall"],
            "confidence_score": scores["confidence"],
            "speech_pace": {
                "word_count": word_count,
                "wpm": pace_eval["wpm"],
                "category": pace_eval["category"],
            },
            "metrics": {
                "speech_pace_wpm": pace_eval["wpm"],
                "pace_category": pace_eval["category"],
                "filler_word_count": filler_eval["total_count"],
                "filler_density": filler_eval["density_per_100_words"],
                "confidence_score": scores["confidence"],
                "clarity_score": scores["clarity"],
                "audience_engagement_score": scores["engagement"],
                "pace_score": scores["pace"],
            },
            "speech_analysis": speech_metrics,
            "speaking_pace_evaluation": pace_eval,
            "filler_word_usage": filler_eval,
            "confidence_assessment": confidence_eval,
            "clarity_assessment": clarity_eval,
            "audience_engagement_measurement": engagement_eval,
            "recommendations": recommendations,
        }

    def _extract_words(self, text: str) -> List[str]:
        return [w.lower() for w in re.findall(r"\b\w+(?:'\w+)?\b", text)]

    def _split_sentences(self, text: str) -> List[str]:
        raw = re.split(r"[.!?]+", text)
        return [s.strip() for s in raw if s.strip()]

    def _empty_response(self, title: str | None) -> Dict[str, Any]:
        return {
            "title": title or "Presentation Analysis",
            "speech_text": "",
            "duration_seconds": None,
            "overall_score": 0,
            "confidence_score": 0,
            "speech_pace": {"word_count": 0, "wpm": 0, "category": "No Speech Data"},
            "metrics": {
                "speech_pace_wpm": 0,
                "pace_category": "No Speech Data",
                "filler_word_count": 0,
                "filler_density": 0.0,
                "confidence_score": 0,
                "clarity_score": 0,
                "audience_engagement_score": 0,
                "pace_score": 0,
            },
            "speech_analysis": {
                "word_count": 0,
                "sentence_count": 0,
                "avg_words_per_sentence": 0.0,
                "unique_words": 0,
                "lexical_diversity_percent": 0.0,
            },
            "speaking_pace_evaluation": {
                "wpm": 0,
                "estimated_duration_minutes": 0.0,
                "category": "No Speech Data",
                "feedback": "No speech text provided.",
            },
            "filler_word_usage": {
                "total_count": 0,
                "density_per_100_words": 0.0,
                "breakdown": {},
                "detected_fillers": [],
            },
            "confidence_assessment": {
                "score": 0,
                "level": "N/A",
                "strong_assertions": [],
                "hedge_words": [],
                "feedback": "Provide speech text for evaluation.",
            },
            "clarity_assessment": {
                "score": 0,
                "avg_sentence_length": 0.0,
                "transitions_found": [],
                "complexity_rating": "N/A",
                "feedback": "Provide speech text for evaluation.",
            },
            "audience_engagement_measurement": {
                "score": 0,
                "rhetorical_questions": 0,
                "hooks_found": [],
                "has_cta": False,
                "feedback": "Provide speech text for evaluation.",
            },
            "recommendations": ["Enter your presentation text to analyze speech metrics."],
        }

    def _analyze_speech(self, words: List[str], sentences: List[str]) -> Dict[str, Any]:
        word_count = len(words)
        sentence_count = max(1, len(sentences))
        avg_wps = round(word_count / sentence_count, 1)
        unique_words = len(set(words))
        lexical_diversity = round((unique_words / max(1, word_count)) * 100, 1)

        return {
            "word_count": word_count,
            "sentence_count": sentence_count,
            "avg_words_per_sentence": avg_wps,
            "unique_words": unique_words,
            "lexical_diversity_percent": lexical_diversity,
        }

    def _evaluate_speaking_pace(
        self, word_count: int, duration_seconds: float | None
    ) -> Dict[str, Any]:
        if duration_seconds and duration_seconds > 0:
            wpm = round((word_count / duration_seconds) * 60, 1)
            duration_minutes = round(duration_seconds / 60, 1)
        else:
            wpm = 135.0
            duration_minutes = round(word_count / 135.0, 1)

        if wpm < 110:
            category = "Slow / Deliberate"
            feedback = (
                "Your speaking pace is slow. This can convey gravitas, but beware of losing listener momentum."
            )
        elif 110 <= wpm <= 160:
            category = "Conversational / Optimal"
            feedback = (
                "Your speaking pace is in the optimal conversational range (110-160 WPM). Excellent for retention."
            )
        elif 161 <= wpm <= 190:
            category = "Brisk / Energetic"
            feedback = (
                "Your speaking pace is fast. Energetic, but ensure key takeaways are punctuated with deliberate pauses."
            )
        else:
            category = "Very Fast / Rush Risk"
            feedback = (
                "Your speaking pace is very fast (>190 WPM). Listeners may struggle to digest your points."
            )

        return {
            "wpm": wpm,
            "estimated_duration_minutes": duration_minutes,
            "category": category,
            "feedback": feedback,
        }

    def _detect_filler_words(self, text: str, words: List[str]) -> Dict[str, Any]:
        word_count = max(1, len(words))
        text_lower = text.lower()
        breakdown: Dict[str, int] = {}
        detected_fillers: List[str] = []

        for filler in self.FILLER_WORDS:
            if " " in filler:
                matches = len(re.findall(r"\b" + re.escape(filler) + r"\b", text_lower))
                if matches > 0:
                    breakdown[filler] = matches
                    detected_fillers.append(filler)

        for word in words:
            if word in self.FILLER_WORDS and " " not in word:
                breakdown[word] = breakdown.get(word, 0) + 1
                if word not in detected_fillers:
                    detected_fillers.append(word)

        total_fillers = sum(breakdown.values())
        density = round((total_fillers / word_count) * 100, 2)

        return {
            "total_count": total_fillers,
            "density_per_100_words": density,
            "breakdown": breakdown,
            "detected_fillers": detected_fillers,
        }

    def _assess_confidence(self, text: str, words: List[str]) -> Dict[str, Any]:
        text_lower = text.lower()
        strong_found = [w for w in self.STRONG_ASSERTIONS if re.search(r"\b" + re.escape(w) + r"\b", text_lower)]
        hedges_found = [w for w in self.HEDGE_WORDS if re.search(r"\b" + re.escape(w) + r"\b", text_lower)]

        strong_count = len(strong_found)
        hedge_count = len(hedges_found)

        base_score = 70
        base_score += min(25, strong_count * 5)
        base_score -= min(35, hedge_count * 8)
        score = max(10, min(100, base_score))

        if score >= 80:
            level = "High Conviction"
            feedback = "Strong assertion phrasing with minimal hedging. Projects authority and confidence."
        elif score >= 55:
            level = "Moderate Confidence"
            feedback = "Generally clear conviction, but occasional hedging weakens important statements."
        else:
            level = "Needs Strengthening"
            feedback = "Frequent hedge words ('maybe', 'I think', 'kind of') diminish your executive presence."

        return {
            "score": score,
            "level": level,
            "strong_assertions": strong_found,
            "hedge_words": hedges_found,
            "feedback": feedback,
        }

    def _assess_clarity(self, text: str, words: List[str], sentences: List[str]) -> Dict[str, Any]:
        word_count = len(words)
        sentence_count = max(1, len(sentences))
        avg_len = word_count / sentence_count
        text_lower = text.lower()

        transitions = [w for w in self.TRANSITION_WORDS if re.search(r"\b" + re.escape(w) + r"\b", text_lower)]

        if avg_len <= 15:
            complexity = "Crisp & Direct"
            length_score = 90
        elif avg_len <= 24:
            complexity = "Balanced"
            length_score = 80
        else:
            complexity = "Complex / Run-on"
            length_score = 55

        transition_bonus = min(15, len(transitions) * 4)
        score = max(10, min(100, length_score + transition_bonus))

        return {
            "score": score,
            "avg_sentence_length": round(avg_len, 1),
            "transitions_found": transitions,
            "complexity_rating": complexity,
            "feedback": f"Average sentence length is {round(avg_len, 1)} words. {len(transitions)} transitional phrase(s) detected.",
        }

    def _measure_engagement(self, text: str, words: List[str], sentences: List[str]) -> Dict[str, Any]:
        text_lower = text.lower()
        rhetorical_questions = text.count("?")

        hooks = [w for w in self.AUDIENCE_HOOKS if re.search(r"\b" + re.escape(w) + r"\b", text_lower)]

        has_cta = any(re.search(r"\b" + re.escape(cta) + r"\b", text_lower) for cta in self.CTA_PHRASES)

        base_score = 50
        base_score += min(20, rhetorical_questions * 7)
        base_score += min(20, len(hooks) * 4)
        if has_cta:
            base_score += 15

        score = max(10, min(100, base_score))

        return {
            "score": score,
            "rhetorical_questions": rhetorical_questions,
            "hooks_found": list(set(hooks)),
            "has_cta": has_cta,
            "feedback": (
                f"Detected {rhetorical_questions} question(s) and {len(hooks)} audience-focus hook(s)."
                + (" Call to action identified." if has_cta else " Consider adding a clear Call to Action.")
            ),
        }

    def _calculate_scores(
        self,
        pace_eval: Dict[str, Any],
        filler_eval: Dict[str, Any],
        confidence_eval: Dict[str, Any],
        clarity_eval: Dict[str, Any],
        engagement_eval: Dict[str, Any],
    ) -> Dict[str, int]:
        wpm = pace_eval["wpm"]
        if 110 <= wpm <= 160:
            pace_score = 95
        elif 90 <= wpm < 110 or 161 <= wpm <= 180:
            pace_score = 80
        else:
            pace_score = 60

        conf_score = confidence_eval["score"]
        clarity_score = clarity_eval["score"]
        eng_score = engagement_eval["score"]

        filler_penalty = min(25, int(filler_eval["density_per_100_words"] * 6))

        weighted = (
            (conf_score * 0.28)
            + (clarity_score * 0.28)
            + (eng_score * 0.24)
            + (pace_score * 0.20)
        )
        overall = max(10, min(100, int(round(weighted - filler_penalty))))

        return {
            "overall": overall,
            "confidence": conf_score,
            "clarity": clarity_score,
            "engagement": eng_score,
            "pace": pace_score,
        }

    def _generate_recommendations(
        self,
        pace_eval: Dict[str, Any],
        filler_eval: Dict[str, Any],
        confidence_eval: Dict[str, Any],
        clarity_eval: Dict[str, Any],
        engagement_eval: Dict[str, Any],
        scores: Dict[str, int],
    ) -> List[str]:
        recs = []

        if filler_eval["total_count"] > 0:
            fillers_str = ", ".join(f"'{f}'" for f in filler_eval["detected_fillers"][:4])
            recs.append(
                f"Reduce filler word usage ({filler_eval['total_count']} detected: {fillers_str}). Replace fillers with deliberate 1-second silent pauses."
            )

        if confidence_eval["hedge_words"]:
            hedges_str = ", ".join(f"'{h}'" for h in confidence_eval["hedge_words"][:3])
            recs.append(
                f"Eliminate weak hedging expressions like {hedges_str}. State points decisively with strong verbs."
            )

        if pace_eval["category"] in ["Slow / Deliberate", "Very Fast / Rush Risk"]:
            recs.append(
                f"Pace adjustment needed ({pace_eval['wpm']} WPM - {pace_eval['category']}). Aim for 120-150 WPM conversational speed."
            )

        if not engagement_eval["has_cta"]:
            recs.append("Add an explicit Call to Action (CTA) near your conclusion to motivate your audience.")

        if engagement_eval["rhetorical_questions"] == 0:
            recs.append("Incorporate 1-2 rhetorical questions to spark audience active thinking during key transitions.")

        if clarity_eval["avg_sentence_length"] > 22:
            recs.append("Shorten long sentences (>22 words on average). Break complex thoughts into punchy statements.")

        if not recs:
            recs.append("Excellent speech structure! Keep practicing with varied cadence and expressive delivery.")

        return recs
