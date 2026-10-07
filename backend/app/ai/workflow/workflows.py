import logging
from typing import Dict, Any, List, Annotated
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END

# Import all service classes
from backend.app.ai.argument_analysis.argument_extractor import ArgumentExtractor
from backend.app.ai.fallacy_detection.fallacy_detector import FallacyDetector
from backend.app.ai.reasoning_engine.reasoning_evaluator import ReasoningEvaluator
from backend.app.ai.feedback_engine.feedback_generator import FeedbackGenerator
from backend.app.ai.scoring_engine.quality_scorer import QualityScorer
from backend.app.ai.argument_analysis.argument_improver import ArgumentImprover

from backend.app.ai.debate_simulation.debate_opponent import DebateOpponent
from backend.app.ai.counterargument_engine.counter_generator import CounterGenerator
from backend.app.ai.coach_engine.coach import CoachEngine
from backend.app.ai.learning_engine.planner import LearningEngine
from backend.app.ai.performance_engine.tracker import PerformanceEngine

from backend.app.ai.presentation_analysis.analyzer import PresentationAnalyzer
from backend.app.ai.speech_analysis.vocal_analyzer import SpeechAnalyzer
from backend.app.ai.video_analysis.visual_analyzer import VisualAnalyzer
from backend.app.ai.report_generator.report_generator import ReportGenerator

logger = logging.getLogger("debate_coach_workflows")

# ==========================================
# 1. ARGUMENT ANALYSIS WORKFLOW STATE
# ==========================================
class ArgumentAnalysisState(TypedDict):
    text: str
    claims: Dict[str, Any]
    reasoning: Dict[str, Any]
    fallacies: List[Dict[str, Any]]
    scores: Dict[str, float]
    feedback: Dict[str, Any]
    improved: Dict[str, Any]
    report: Dict[str, Any]

def build_argument_analysis_graph():
    extractor = ArgumentExtractor()
    fallacy_det = FallacyDetector()
    reasoning_eval = ReasoningEvaluator()
    feedback_gen = FeedbackGenerator()
    scorer = QualityScorer()
    improver = ArgumentImprover()

    # Define Node functions
    def planner_node(state: ArgumentAnalysisState) -> Dict[str, Any]:
        logger.info("Executing Argument Analysis Planner Node")
        return {}

    def extraction_node(state: ArgumentAnalysisState) -> Dict[str, Any]:
        logger.info("Executing Argument Extraction Node")
        claims = extractor.extract(state["text"])
        return {"claims": claims}

    def reasoning_node(state: ArgumentAnalysisState) -> Dict[str, Any]:
        logger.info("Executing Reasoning Node")
        reasoning = reasoning_eval.evaluate(state["text"])
        return {"reasoning": reasoning}

    def fallacy_node(state: ArgumentAnalysisState) -> Dict[str, Any]:
        logger.info("Executing Fallacy Detection Node")
        fallacies = fallacy_det.detect(state["text"])
        return {"fallacies": fallacies}

    def scoring_node(state: ArgumentAnalysisState) -> Dict[str, Any]:
        logger.info("Executing Scoring Node")
        scores = scorer.score_from_analysis(state["text"], state.get("fallacies", []), state.get("reasoning", {}))
        return {"scores": scores}

    def feedback_node(state: ArgumentAnalysisState) -> Dict[str, Any]:
        logger.info("Executing Feedback Node")
        feedback = feedback_gen.generate(state["text"])
        improved = improver.improve(state["text"])
        return {"feedback": feedback, "improved": improved}

    def report_node(state: ArgumentAnalysisState) -> Dict[str, Any]:
        logger.info("Executing Report Generation Node")
        report = {
            "text": state["text"],
            "claims": state.get("claims", {}),
            "reasoning": state.get("reasoning", {}),
            "fallacies": state.get("fallacies", []),
            "scores": state.get("scores", {}),
            "feedback": state.get("feedback", {}),
            "improved": state.get("improved", {})
        }
        return {"report": report}

    # Construct LangGraph StateGraph
    workflow = StateGraph(ArgumentAnalysisState)
    
    workflow.add_node("planner", planner_node)
    workflow.add_node("extraction", extraction_node)
    workflow.add_node("reasoning", reasoning_node)
    workflow.add_node("fallacies", fallacy_node)
    workflow.add_node("scoring", scoring_node)
    workflow.add_node("feedback", feedback_node)
    workflow.add_node("report", report_node)

    # State Flow: Start -> Planner -> Extraction -> Reasoning -> Fallacies -> Scoring -> Feedback -> Report -> End
    workflow.add_edge(START, "planner")
    workflow.add_edge("planner", "extraction")
    workflow.add_edge("extraction", "reasoning")
    workflow.add_edge("reasoning", "fallacies")
    workflow.add_edge("fallacies", "scoring")
    workflow.add_edge("scoring", "feedback")
    workflow.add_edge("feedback", "report")
    workflow.add_edge("report", END)

    return workflow.compile()


# ==========================================
# 2. DEBATE SIMULATION WORKFLOW STATE
# ==========================================
class DebateSimState(TypedDict):
    session_id: int
    topic: str
    format: str
    stance: str
    difficulty: str
    personality: str
    user_input: str
    history: List[Dict[str, str]]
    
    # Generated outputs
    rebuttal: Dict[str, Any]
    counterarguments: List[Dict[str, Any]]
    coaching: Dict[str, Any]
    performance: Dict[str, Any]
    learning_plan: Dict[str, Any]
    final_report: Dict[str, Any]

def build_debate_simulation_graph():
    opponent = DebateOpponent()
    counter_eng = CounterGenerator()
    coach = CoachEngine()
    planner = LearningEngine()
    tracker = PerformanceEngine()

    def planner_node(state: DebateSimState) -> Dict[str, Any]:
        logger.info("Executing Debate Simulation Planner Node")
        return {}

    def strategy_node(state: DebateSimState) -> Dict[str, Any]:
        logger.info("Executing Debate Strategy Node")
        return {}

    def opponent_node(state: DebateSimState) -> Dict[str, Any]:
        logger.info("Executing Opponent Node")
        rebut = opponent.generate_rebuttal(
            topic=state["topic"],
            format_name=state["format"],
            stance=state["stance"],
            personality=state["personality"],
            difficulty=state["difficulty"],
            user_message=state["user_input"],
            history=state["history"]
        )
        return {"rebuttal": rebut}

    def counterargument_node(state: DebateSimState) -> Dict[str, Any]:
        logger.info("Executing Counterargument Node")
        counters = counter_eng.generate(state["user_input"])
        return {"counterarguments": counters}

    def coach_node(state: DebateSimState) -> Dict[str, Any]:
        logger.info("Executing Coach Node")
        # Create full round history including the new user response
        full_round_history = list(state["history"])
        full_round_history.append({"speaker": "user", "message": state["user_input"]})
        if "rebuttal" in state and "rebuttal" in state["rebuttal"]:
            full_round_history.append({"speaker": "ai", "message": state["rebuttal"]["rebuttal"]})
            
        coach_eval = coach.evaluate_round(full_round_history)
        return {"coaching": coach_eval}

    def performance_node(state: DebateSimState) -> Dict[str, Any]:
        logger.info("Executing Performance Node")
        # Extract a mock trajectory from coach history scores
        mock_rec = {
            "debate_score": state.get("coaching", {}).get("scores", {}).get("reasoning", 70.0),
            "communication_score": state.get("coaching", {}).get("scores", {}).get("communication", 70.0),
            "critical_thinking_score": state.get("coaching", {}).get("scores", {}).get("logic", 70.0)
        }
        perf = tracker.evaluate_trends([mock_rec])
        return {"performance": perf}

    def learning_plan_node(state: DebateSimState) -> Dict[str, Any]:
        logger.info("Executing Learning Plan Node")
        weaknesses = state.get("coaching", {}).get("weaknesses", [])
        plan = planner.generate_plan(
            weaknesses=weaknesses,
            goal=f"Debate optimization for {state['topic']}",
            difficulty=state["difficulty"]
        )
        return {"learning_plan": plan}

    def final_report_node(state: DebateSimState) -> Dict[str, Any]:
        logger.info("Executing Final Report Node")
        report = {
            "session_id": state["session_id"],
            "topic": state["topic"],
            "format": state["format"],
            "stance": state["stance"],
            "rebuttal": state.get("rebuttal", {}),
            "coaching": state.get("coaching", {}),
            "performance": state.get("performance", {}),
            "learning_plan": state.get("learning_plan", {})
        }
        return {"final_report": report}

    workflow = StateGraph(DebateSimState)
    
    workflow.add_node("planner", planner_node)
    workflow.add_node("strategy", strategy_node)
    workflow.add_node("opponent", opponent_node)
    workflow.add_node("counterargument", counterargument_node)
    workflow.add_node("coach", coach_node)
    workflow.add_node("performance", performance_node)
    workflow.add_node("learning_plan", learning_plan_node)
    workflow.add_node("final_report", final_report_node)

    # Connections
    workflow.add_edge(START, "planner")
    workflow.add_edge("planner", "strategy")
    workflow.add_edge("strategy", "opponent")
    workflow.add_edge("opponent", "counterargument")
    workflow.add_edge("counterargument", "coach")
    workflow.add_edge("coach", "performance")
    workflow.add_edge("performance", "learning_plan")
    workflow.add_edge("learning_plan", "final_report")
    workflow.add_edge("final_report", END)

    return workflow.compile()


# ==========================================
# 3. PRESENTATION ANALYSIS WORKFLOW STATE
# ==========================================
class PresentationAnalysisState(TypedDict):
    video_path: str
    audio_path: str
    transcript: str
    slides: str
    
    # Outputs
    speech_metrics: Dict[str, Any]
    video_metrics: Dict[str, Any]
    analysis: Dict[str, Any]
    scores: Dict[str, float]
    feedback: Dict[str, Any]
    report: Dict[str, Any]
    dashboard_update: Dict[str, Any]

def build_presentation_analysis_graph():
    speech_analyzer = SpeechAnalyzer()
    video_analyzer = VisualAnalyzer()
    pres_analyzer = PresentationAnalyzer()
    report_gen = ReportGenerator()

    def speech_node(state: PresentationAnalysisState) -> Dict[str, Any]:
        logger.info("Executing Speech Analysis Node")
        speech_results = speech_analyzer.analyze_audio(state["audio_path"], transcript=state["transcript"])
        return {"speech_metrics": speech_results}

    def video_node(state: PresentationAnalysisState) -> Dict[str, Any]:
        logger.info("Executing Video Analysis Node")
        video_results = video_analyzer.analyze_video(state["video_path"])
        return {"video_metrics": video_results}

    def presentation_node(state: PresentationAnalysisState) -> Dict[str, Any]:
        logger.info("Executing Presentation Analysis Node")
        pres_results = pres_analyzer.analyze(state["transcript"], state["slides"])
        return {"analysis": pres_results}

    def scoring_node(state: PresentationAnalysisState) -> Dict[str, Any]:
        logger.info("Executing Scoring Node")
        # Combine speech, video, and presentation scores
        s_score = state.get("speech_metrics", {}).get("scores", {}).get("overall_speech_score", 70.0)
        v_score = state.get("video_metrics", {}).get("scores", {}).get("overall_video_score", 70.0)
        p_scores = state.get("analysis", {}).get("scores", {})
        
        combined_scores = {
            "confidence_score": p_scores.get("confidence", 70.0),
            "clarity_score": p_scores.get("communication", 70.0),
            "engagement_score": p_scores.get("engagement", 70.0),
            "pace_score": s_score,
            "overall_score": (p_scores.get("professionalism", 70.0) + s_score + v_score) / 3.0
        }
        return {"scores": combined_scores}

    def feedback_node(state: PresentationAnalysisState) -> Dict[str, Any]:
        logger.info("Executing Feedback Node")
        # Combine feedback notes
        s_tips = state.get("speech_metrics", {}).get("speech_tips", [])
        v_tips = state.get("video_metrics", {}).get("video_tips", [])
        p_feedback = state.get("analysis", {}).get("feedback", {})
        
        combined_feedback = {
            "strengths": p_feedback.get("strengths", []) + ["Clear vocal pitch stability."],
            "weaknesses": p_feedback.get("weaknesses", []) + ["Occasional lack of eye contact with camera."],
            "suggestions": p_feedback.get("suggestions", []) + s_tips + v_tips,
            "slide_improvements": p_feedback.get("slide_improvements", [])
        }
        return {"feedback": combined_feedback}

    def report_node(state: PresentationAnalysisState) -> Dict[str, Any]:
        logger.info("Executing Report Generation Node")
        full_data = {
            "scores": state.get("scores", {}),
            "speech_metrics": state.get("speech_metrics", {}).get("metrics", {}),
            "video_metrics": state.get("video_metrics", {}).get("metrics", {}),
            "feedback": state.get("feedback", {})
        }
        # In actual API execution we'll generate PDF/JSON to disk
        return {"report": full_data}

    def dashboard_node(state: PresentationAnalysisState) -> Dict[str, Any]:
        logger.info("Executing Dashboard Update Node")
        return {"dashboard_update": {"status": "success"}}

    workflow = StateGraph(PresentationAnalysisState)
    
    workflow.add_node("speech", speech_node)
    workflow.add_node("video", video_node)
    workflow.add_node("presentation", presentation_node)
    workflow.add_node("scoring", scoring_node)
    workflow.add_node("feedback", feedback_node)
    workflow.add_node("report", report_node)
    workflow.add_node("dashboard", dashboard_node)

    # Connections: Upload (Start) -> Speech -> Video -> Presentation -> Scoring -> Feedback -> Report -> Dashboard -> End
    workflow.add_edge(START, "speech")
    workflow.add_edge("speech", "video")
    workflow.add_edge("video", "presentation")
    workflow.add_edge("presentation", "scoring")
    workflow.add_edge("scoring", "feedback")
    workflow.add_edge("feedback", "report")
    workflow.add_edge("report", "dashboard")
    workflow.add_edge("dashboard", END)

    return workflow.compile()
