"""Unit tests for the Presentation Analysis Engine."""

from presentation_engine import PresentationAnalysisEngine


def test_presentation_engine_basic_analysis():
    engine = PresentationAnalysisEngine()
    speech = (
        "Good morning everyone. Imagine a world where clean energy powers every home. "
        "Um, we must act today because climate change is definitely the most crucial challenge "
        "of our generation. How will we respond? I urge you to join us in this mission."
    )
    result = engine.analyze(text=speech, duration_seconds=30.0, title="Keynote Pitch")

    assert result["title"] == "Keynote Pitch"
    assert result["overall_score"] > 0
    metrics = result["metrics"]
    assert metrics["speech_pace_wpm"] > 0
    assert metrics["filler_word_count"] >= 1
    assert metrics["confidence_score"] >= 60
    assert metrics["clarity_score"] >= 60
    assert metrics["audience_engagement_score"] >= 60
    assert "Conversational" in metrics["pace_category"] or "Optimal" in metrics["pace_category"] or "Deliberate" in metrics["pace_category"]


def test_presentation_engine_speaking_pace():
    engine = PresentationAnalysisEngine()
    text = "Word " * 200  # 200 words

    # 60 seconds = 200 WPM (Very Fast)
    res_fast = engine.analyze(text=text, duration_seconds=60.0)
    assert res_fast["metrics"]["speech_pace_wpm"] == 200.0
    assert "Fast" in res_fast["metrics"]["pace_category"]

    # 100 seconds = 120 WPM (Conversational)
    res_opt = engine.analyze(text=text, duration_seconds=100.0)
    assert res_opt["metrics"]["speech_pace_wpm"] == 120.0
    assert "Conversational" in res_opt["metrics"]["pace_category"] or "Optimal" in res_opt["metrics"]["pace_category"]


def test_presentation_engine_filler_words():
    engine = PresentationAnalysisEngine()
    speech = "Um, like, basically, you know, we should, uh, start the project honestly."
    result = engine.analyze(text=speech)
    fillers = result["filler_word_usage"]

    assert fillers["total_count"] >= 4
    assert fillers["density_per_100_words"] > 0
    assert "um" in fillers["detected_fillers"]
    assert "like" in fillers["detected_fillers"]


def test_presentation_engine_confidence_and_clarity():
    engine = PresentationAnalysisEngine()
    confident_speech = (
        "We will definitely succeed. The evidence is clearly proven. "
        "Our team must execute this essential plan with absolute conviction."
    )
    result = engine.analyze(text=confident_speech)
    conf = result["confidence_assessment"]

    assert conf["score"] >= 85
    assert "definitely" in conf["strong_assertions"]
    assert len(conf["hedge_words"]) == 0

    hesitant_speech = "Maybe we could sort of try to fix it, but I guess I'm not sure if it works."
    result_hesitant = engine.analyze(text=hesitant_speech)
    assert result_hesitant["confidence_assessment"]["score"] < 65
    assert len(result_hesitant["confidence_assessment"]["hedge_words"]) > 0


def test_presentation_engine_audience_engagement():
    engine = PresentationAnalysisEngine()
    engaging_speech = (
        "Have you ever wondered how innovation happens? Imagine what we can build together. "
        "I challenge you today: let us take action now!"
    )
    result = engine.analyze(text=engaging_speech)
    eng = result["audience_engagement_measurement"]

    assert eng["rhetorical_questions"] >= 1
    assert len(eng["hooks_found"]) >= 1
    assert eng["has_cta"] is True
    assert result["metrics"]["audience_engagement_score"] >= 75


def test_presentation_engine_empty_input():
    engine = PresentationAnalysisEngine()
    result = engine.analyze(text="")
    assert result["overall_score"] == 0
    assert result["metrics"]["speech_pace_wpm"] == 0
    assert len(result["recommendations"]) > 0


if __name__ == "__main__":
    print("Running Presentation Engine tests...")
    test_presentation_engine_basic_analysis()
    print("[PASS] test_presentation_engine_basic_analysis")
    test_presentation_engine_speaking_pace()
    print("[PASS] test_presentation_engine_speaking_pace")
    test_presentation_engine_filler_words()
    print("[PASS] test_presentation_engine_filler_words")
    test_presentation_engine_confidence_and_clarity()
    print("[PASS] test_presentation_engine_confidence_and_clarity")
    test_presentation_engine_audience_engagement()
    print("[PASS] test_presentation_engine_audience_engagement")
    test_presentation_engine_empty_input()
    print("[PASS] test_presentation_engine_empty_input")
    print("All presentation engine tests passed successfully!")
