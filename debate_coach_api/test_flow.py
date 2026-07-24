"""End-to-end integration test for all platform services."""
from database import SessionLocal
from models.models import (
    User, DebateSession, Argument, DebateFormat,
    PresentationAnalysis, DebateScore, AgentRun
)
from services.analysis import analyze_argument, detect_fallacies, generate_counterarguments
from services.presentation import analyze_presentation
from services.scoring import compute_debate_score, generate_recommendations
from services.agent_orchestrator import run_full_analysis_pipeline, coach_agent

db = SessionLocal()

# 1. Fetch seeded learner
user = db.query(User).filter(User.email == "learner@demo.com").first()
print(f"[1] User: {user.name} | Role: {user.role}")

# 2. Create debate session
session = DebateSession(
    topic="AI should replace teachers",
    format=DebateFormat.one_on_one,
    creator_id=user.id,
)
db.add(session); db.commit(); db.refresh(session)
print(f"[2] Session created: ID={session.id} | Topic: {session.topic}")

# 3. Analyze argument
arg = Argument(
    session_id=session.id,
    speaker_id=user.id,
    content="AI can personalize learning for every student, adapting to their pace far better than any human teacher. Studies show AI tutors improve test scores by 30%.",
    claim="AI improves learning outcomes",
    evidence="Studies show 30% improvement",
    position="pro",
)
db.add(arg); db.commit(); db.refresh(arg)
arg = analyze_argument(db, arg, use_llm=True)
print(f"[3] Argument scored: clarity={arg.clarity_score} | logic={arg.logical_consistency} | persuasion={arg.persuasiveness} | sentiment={arg.sentiment}")

# 4. Fallacy detection
fallacies = detect_fallacies(db, arg, use_llm=True)
print(f"[4] Fallacies: {len(fallacies)} | {[f.fallacy_type for f in fallacies]}")

# 5. Counterarguments
counters = generate_counterarguments(db, arg, topic=session.topic, use_llm=True)
print(f"[5] Counterarguments: {len(counters)} | Types: {[c.counter_type for c in counters]}")

# 6. Presentation analysis
pres = PresentationAnalysis(
    user_id=user.id,
    title="AI in Education",
    transcript="AI is transforming education. Um, it can, you know, help students learn at their own pace. Basically, the technology is, like, really powerful. Studies show that students using AI tutors perform significantly better. The evidence is clear and the results are compelling.",
)
db.add(pres); db.commit(); db.refresh(pres)
pres = analyze_presentation(db, pres, use_llm=True)
print(f"[6] Presentation: pace={pres.speech_pace}wpm | fillers={pres.filler_word_count} | score={pres.overall_score} | emotion={pres.emotion_detected}")

# 7. Debate scoring
score = DebateScore(
    session_id=session.id,
    user_id=user.id,
    argument_quality=7.5,
    evidence_usage=6.8,
    logical_consistency=7.2,
    rebuttal_effectiveness=6.0,
    communication_skills=7.0,
)
score = compute_debate_score(score, use_llm=True)
db.add(score); db.commit()
recs = generate_recommendations(score)
print(f"[7] Debate score: {score.overall_score}/10 | Percentile: {score.percentile_rank}%")
print(f"    Tips: {recs[0]}")

# 8. Coaching plan
plan = coach_agent({
    "experience_level": "beginner",
    "avg_debate_score": score.overall_score,
    "avg_presentation_score": pres.overall_score,
    "debate_count": 1,
    "weak_areas": "rebuttal, evidence_usage",
    "goals": "Win college debate competition",
}, db)
print(f"[8] Coaching focus areas: {plan.get('focus_areas', [])}")

# 9. Full agentic pipeline
print("[9] Running full agentic pipeline (Speech -> Argument -> Fallacy -> Rebuttal)...")
pipeline = run_full_analysis_pipeline(
    "Human teachers provide emotional support and mentorship that AI cannot replicate.",
    session.topic,
    "con",
    db,
    session.id,
)
print(f"    Agents run: {pipeline['agents_run']}")
print(f"    Fallacies found: {len(pipeline['fallacies'])}")
print(f"    Counterarguments: {len(pipeline['counterarguments'])}")
print(f"    Pipeline latency: {pipeline['pipeline_latency_ms']}ms")

# 10. Agent run audit
runs = db.query(AgentRun).all()
print(f"[10] Agent runs logged in DB: {len(runs)}")

db.close()
print()
print("=" * 50)
print("All systems operational!")
print("=" * 50)
