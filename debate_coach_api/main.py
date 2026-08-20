import uuid
import time
import structlog
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from config import APP_VERSION, CORS_ORIGINS, APP_ENV
from database import engine, SessionLocal
from models.models import Base, User, UserProfile, RoleEnum, Notification
from utils.auth import hash_password
from routers import (
    auth, profile, debates, arguments, presentations,
    scoring, dashboard, reports, notifications, admin,
)
from routers import ai_debate, coaching, analytics, search

# ── Logging ───────────────────────────────────────────────────────────────────
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.add_log_level,
        structlog.processors.JSONRenderer(),
    ]
)
logger = structlog.get_logger()

# ── DB Init ───────────────────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── Rate Limiter ──────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Debate Coach & Presentation Analysis Platform",
    description=(
        "Enterprise-grade Agentic AI platform for debate coaching, argument analysis, "
        "fallacy detection, presentation feedback, and personalized learning. "
        "Powered by LLMs, vector search, and multi-agent orchestration."
    ),
    version=APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request ID + Logging Middleware ───────────────────────────────────────────
@app.middleware("http")
async def request_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())[:8]
    start = time.time()
    request.state.request_id = request_id

    response: Response = await call_next(request)

    duration_ms = round((time.time() - start) * 1000, 1)
    logger.info(
        "request",
        request_id=request_id,
        method=request.method,
        path=request.url.path,
        status=response.status_code,
        duration_ms=duration_ms,
    )
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time"] = f"{duration_ms}ms"
    return response

# ── Audit Log Middleware ──────────────────────────────────────────────────────
@app.middleware("http")
async def audit_middleware(request: Request, call_next):
    response = await call_next(request)
    # Only log mutating operations
    if request.method in ("POST", "PUT", "PATCH", "DELETE"):
        try:
            db = SessionLocal()
            from models.models import AuditLog
            log = AuditLog(
                action=request.method,
                resource=request.url.path,
                ip_address=request.client.host if request.client else None,
                user_agent=request.headers.get("user-agent", "")[:200],
                status_code=response.status_code,
            )
            db.add(log)
            db.commit()
            db.close()
        except Exception:
            pass
    return response

# ── Prometheus Metrics ────────────────────────────────────────────────────────
try:
    from prometheus_fastapi_instrumentator import Instrumentator
    Instrumentator().instrument(app).expose(app, endpoint="/metrics")
except ImportError:
    pass

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(debates.router)
app.include_router(arguments.router)
app.include_router(presentations.router)
app.include_router(scoring.router)
app.include_router(dashboard.router)
app.include_router(reports.router)
app.include_router(notifications.router)
app.include_router(admin.router)
app.include_router(ai_debate.router)
app.include_router(coaching.router)
app.include_router(analytics.router)
app.include_router(search.router)


# ── Health & Info ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "service": "Debate Coach & Presentation Analysis Platform",
        "version": APP_VERSION,
        "environment": APP_ENV,
        "status": "healthy",
        "docs": "/docs",
        "redoc": "/redoc",
        "metrics": "/metrics",
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "version": APP_VERSION}


# ── DB Seed ───────────────────────────────────────────────────────────────────
import json
import random
from datetime import datetime
from models.models import DebateFormat, ExperienceLevel, DebateSession, AIDebateSession, Argument, DebateScore, PresentationAnalysis, CoachingPlan, SkillRecord, AgentRun, AuditLog


def seed_database():
    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            return

        now = datetime.utcnow()

        # ============================================================
        # 1. USERS (12 diverse users with profiles)
        # ============================================================
        user_defs = [
            {"name": "Alice Learner",   "email": "learner@demo.com",    "password": "password123", "role": RoleEnum.learner,   "level": "intermediate", "goals": "Win the regional debate championship this semester", "topics": "Technology, Politics, Science, Education"},
            {"name": "Bob Coach",       "email": "coach@demo.com",      "password": "password123", "role": RoleEnum.coach,     "level": "expert",   "goals": "Develop next-gen debate training methodologies", "topics": "Debate pedagogy, Argumentation theory, Rhetoric"},
            {"name": "Carol Educator",  "email": "educator@demo.com",   "password": "password123", "role": RoleEnum.educator,  "level": "advanced", "goals": "Integrate debate into high school curriculum", "topics": "Education reform, Critical thinking, Curriculum design"},
            {"name": "Dave Admin",      "email": "admin@demo.com",      "password": "password123", "role": RoleEnum.admin,     "level": "expert",   "goals": "Manage platform operations and user growth", "topics": "Platform management, AI ethics, Data analytics"},
            {"name": "Emma Thompson",   "email": "emma@demo.com",       "password": "password123", "role": RoleEnum.learner,   "level": "beginner",  "goals": "Build confidence in public speaking and argumentation", "topics": "Climate change, Social justice, Healthcare"},
            {"name": "Frank Martinez",  "email": "frank@demo.com",      "password": "password123", "role": RoleEnum.learner,   "level": "advanced", "goals": "Prepare for law school debate competitions", "topics": "Law, Politics, Economics, Philosophy"},
            {"name": "Grace Kim",       "email": "grace@demo.com",      "password": "password123", "role": RoleEnum.coach,     "level": "advanced", "goals": "Coach university debate team to national finals", "topics": "Policy debate, Lincoln-Douglas, Public forum"},
            {"name": "Henry Wilson",    "email": "henry@demo.com",      "password": "password123", "role": RoleEnum.learner,   "level": "intermediate", "goals": "Improve rebuttal skills and evidence usage", "topics": "Technology, AI, Future studies"},
            {"name": "Iris Chen",       "email": "iris@demo.com",       "password": "password123", "role": RoleEnum.learner,   "level": "beginner",  "goals": "Overcome stage fright and learn debate fundamentals", "topics": "Arts, Culture, Education"},
            {"name": "Jack Robinson",   "email": "jack@demo.com",       "password": "password123", "role": RoleEnum.educator,  "level": "intermediate", "goals": "Create debate syllabus for undergraduate program", "topics": "Philosophy, Ethics, Political science"},
            {"name": "Karen Davis",     "email": "karen@demo.com",      "password": "password123", "role": RoleEnum.learner,   "level": "advanced", "goals": "Master parliamentary debate format", "topics": "International relations, Economics, Environment"},
            {"name": "Leo Garcia",      "email": "leo@demo.com",        "password": "password123", "role": RoleEnum.learner,   "level": "intermediate", "goals": "Transition from public speaking to competitive debate", "topics": "Sports, Business, Technology"},
        ]

        created_users = []
        for u in user_defs:
            user = User(
                name=u["name"],
                email=u["email"],
                hashed_password=hash_password(u["password"]),
                role=u["role"],
                is_verified=True,
                last_login=now,
            )
            db.add(user)
            db.flush()
            db.add(UserProfile(
                user_id=user.id,
                experience_level=u["level"],
                goals=u["goals"],
                preferred_topics=u["topics"],
                presentation_domains="Academic, Professional, Technical",
                debate_count=random.randint(3, 25),
                presentation_count=random.randint(1, 15),
                avg_debate_score=round(random.uniform(5.5, 8.8), 2),
                avg_presentation_score=round(random.uniform(5.0, 8.5), 2),
                total_practice_minutes=random.randint(120, 5000),
                streak_days=random.randint(1, 60),
                badges="[]",
            ))
            created_users.append(user)
            db.flush()

        # Welcome notifications for all users
        for u in created_users:
            db.add(Notification(user_id=u.id, title="Welcome to Debate Coach AI!", message=f"Hello {u.name}! Your AI-powered debate coaching journey starts now.", notification_type="info", channel="in_app", created_at=now))
            db.add(Notification(user_id=u.id, title="Complete Your Profile", message="Set up your preferences to get personalized coaching recommendations.", notification_type="reminder", channel="in_app", created_at=now))

        db.flush()

        alice = created_users[0]  # learner
        bob = created_users[1]    # coach
        carol = created_users[2]  # educator
        dave = created_users[3]   # admin
        emma = created_users[4]   # learner
        frank = created_users[5]  # learner
        grace = created_users[6]  # coach
        henry = created_users[7]  # learner
        iris = created_users[8]   # learner
        jack = created_users[9]   # educator
        karen = created_users[10] # learner
        leo = created_users[11]   # learner

        # ============================================================
        # 2. DEBATE SESSIONS (6 diverse sessions)
        # ============================================================
        debate_data = [
            {"topic": "Artificial Intelligence Should Replace Human Teachers in Classrooms", "format": DebateFormat.oxford, "creator": alice, "status": "completed", "duration": 45},
            {"topic": "Climate Change is the Single Greatest Threat to Global Security", "format": DebateFormat.public_forum, "creator": alice, "status": "completed", "duration": 60},
            {"topic": "Universal Basic Income Should Be Implemented Worldwide", "format": DebateFormat.parliamentary, "creator": bob, "status": "active", "duration": 90},
            {"topic": "Remote Work is More Productive Than Office-Based Work", "format": DebateFormat.one_on_one, "creator": carol, "status": "scheduled", "duration": 30, "scheduled": "2025-02-15 14:00:00"},
            {"topic": "Social Media Does More Harm Than Good to Society", "format": DebateFormat.policy, "creator": dave, "status": "completed", "duration": 50},
            {"topic": "Space Exploration is a Waste of Resources That Should Be Spent on Earthly Problems", "format": DebateFormat.oxford, "creator": bob, "status": "scheduled", "duration": 45, "scheduled": "2025-03-01 10:00:00"},
        ]

        created_debates = []
        for d in debate_data:
            session = DebateSession(
                topic=d["topic"],
                format=d["format"],
                creator_id=d["creator"].id,
                participant_ids=f"{d['creator'].id},{bob.id},{carol.id}",
                position_map=json.dumps({str(d['creator'].id): "pro", str(bob.id): "con", str(carol.id): "pro"}),
                scheduled_at=datetime.strptime(d.get("scheduled", "2025-01-01 00:00:00"), "%Y-%m-%d %H:%M:%S") if d.get("scheduled") else None,
                status=d["status"],
                duration_minutes=d["duration"],
                transcript=f"Full debate transcript for: {d['topic']}",
                created_at=now,
            )
            db.add(session)
            db.flush()
            created_debates.append(session)

        # ============================================================
        # 3. ARGUMENTS (12 arguments across debates)
        # ============================================================
        argument_data = [
            # Debate 1: AI vs Teachers (4 arguments)
            {"session": created_debates[0], "speaker": alice, "content": "AI can personalize learning at scale, adapting to each student's pace and style. Machine learning algorithms can identify knowledge gaps instantly and provide targeted exercises, something impossible for a human teacher managing 30 students.", "claim": "AI enables true personalized learning", "evidence": "Studies from Stanford's AI in Education Lab show 40% faster skill acquisition with AI tutors", "position": "pro", "clarity": 8.5, "relevance": 9.0, "evidence_str": 8.0, "logic": 8.5, "persuasion": 8.3, "sentiment": "confident"},
            {"session": created_debates[0], "speaker": bob, "content": "Human teachers provide emotional mentorship, empathy, and moral guidance that AI cannot replicate. Education is not just information transfer — it's about building character, resilience, and social skills through human connection.", "claim": "Teachers provide irreplaceable human mentorship", "evidence": "Decades of educational psychology research emphasize the teacher-student relationship as critical", "position": "con", "clarity": 9.0, "relevance": 9.2, "evidence_str": 7.5, "logic": 8.8, "persuasion": 8.9, "sentiment": "passionate"},
            {"session": created_debates[0], "speaker": carol, "content": "AI systems are biased by their training data, and deploying them in classrooms could perpetuate systemic inequalities. We've seen AI systems discriminate against minority groups in hiring and criminal justice — education cannot afford similar failures.", "claim": "AI bias could worsen educational inequality", "evidence": "MIT Media Lab study found facial recognition misidentifies minority students at 3x higher rates", "position": "con", "clarity": 8.8, "relevance": 8.5, "evidence_str": 8.5, "logic": 8.2, "persuasion": 8.5, "sentiment": "concerned"},
            {"session": created_debates[0], "speaker": alice, "content": "AI doesn't have to replace teachers — it augments them. AI handles grading, lesson planning, and administrative tasks, freeing teachers to focus on what they do best: inspiring and mentoring students. The future is AI-assisted, not AI-replaced education.", "claim": "AI augments rather than replaces teachers", "evidence": "Schools using AI assistants report 30% reduction in teacher administrative workload", "position": "pro", "clarity": 9.2, "relevance": 9.0, "evidence_str": 8.2, "logic": 9.0, "persuasion": 9.1, "sentiment": "optimistic"},

            # Debate 2: Climate Change (3 arguments)
            {"session": created_debates[1], "speaker": alice, "content": "Climate change is already causing unprecedented natural disasters, mass migration, and economic disruption. The UN reports that we have less than a decade to prevent irreversible damage. This is not a future threat — it is a present emergency.", "claim": "Climate change is an immediate crisis", "evidence": "IPCC 2023 report confirms irreversible tipping points approaching", "position": "pro", "clarity": 9.1, "relevance": 9.3, "evidence_str": 9.0, "logic": 8.7, "persuasion": 9.0, "sentiment": "urgent"},
            {"session": created_debates[1], "speaker": bob, "content": "While climate change is serious, framing it as an existential threat can lead to policy overreach and economic damage. We need measured, evidence-based approaches that balance environmental protection with economic stability.", "claim": "Climate policy must balance environment and economy", "evidence": "Economic models show aggressive carbon taxes could reduce GDP by 5% in developing nations", "position": "con", "clarity": 8.5, "relevance": 8.8, "evidence_str": 8.0, "logic": 8.5, "persuasion": 8.2, "sentiment": "measured"},
            {"session": created_debates[1], "speaker": carol, "content": "The technology to address climate change already exists — renewable energy, carbon capture, and sustainable agriculture. What we lack is the political will and international cooperation to implement these solutions at the required scale.", "claim": "Solutions exist, political will is lacking", "evidence": "IEA reports renewable energy is now cheaper than fossil fuels in 90% of markets", "position": "pro", "clarity": 8.7, "relevance": 8.5, "evidence_str": 8.8, "logic": 8.5, "persuasion": 8.6, "sentiment": "hopeful"},

            # Debate 3: UBI (2 arguments)
            {"session": created_debates[2], "speaker": bob, "content": "Universal Basic Income is the logical response to automation and AI-driven job displacement. It provides a safety net that allows people to retrain, start businesses, and contribute creatively to society without the fear of destitution.", "claim": "UBI is necessary for the age of automation", "evidence": "Pilot programs in Finland and Kenya show UBI improves mental health and entrepreneurship", "position": "pro", "clarity": 8.8, "relevance": 8.5, "evidence_str": 8.0, "logic": 8.5, "persuasion": 8.0, "sentiment": "confident"},
            {"session": created_debates[2], "speaker": carol, "content": "UBI is economically unsustainable and could disincentivize work. We should invest in education, job training, and social services rather than simply giving everyone money. The Scandinavian model of active labor market policies works better.", "claim": "UBI is economically unsustainable", "evidence": "OECD estimates a basic income at 25% of GDP in developed nations", "position": "con", "clarity": 8.5, "relevance": 8.2, "evidence_str": 7.8, "logic": 8.0, "persuasion": 7.5, "sentiment": "skeptical"},

            # Debate 4: Remote Work (1 argument)
            {"session": created_debates[3], "speaker": carol, "content": "Remote work eliminates commute time, reduces carbon emissions, and allows for deep focused work. A Stanford study of 16,000 workers over 2 years found a 13% increase in productivity for remote workers compared to office workers.", "claim": "Remote work boosts productivity", "evidence": "Stanford study: 13% productivity increase for remote workers", "position": "pro", "clarity": 9.0, "relevance": 8.8, "evidence_str": 9.0, "logic": 8.5, "persuasion": 8.5, "sentiment": "confident"},

            # Debate 5: Social Media (2 arguments)
            {"session": created_debates[4], "speaker": dave, "content": "Social media platforms are designed to be addictive, exploiting psychological vulnerabilities for profit. They spread misinformation, exacerbate political polarization, and are directly linked to rising rates of anxiety and depression among young people.", "claim": "Social media causes psychological harm", "evidence": "Journal of the American Medical Association: teens using social media 3+ hours/day have 60% higher depression rates", "position": "pro", "clarity": 8.8, "relevance": 9.0, "evidence_str": 8.5, "logic": 8.2, "persuasion": 8.5, "sentiment": "concerned"},
            {"session": created_debates[4], "speaker": alice, "content": "Social media connects people across borders, amplifies marginalized voices, and enables social movements. It's a tool — and like any tool, its impact depends on how we use it. The solution is digital literacy education, not blanket condemnation.", "claim": "Social media connects and empowers", "evidence": "Arab Spring, Black Lives Matter, and climate activism were enabled by social media organizing", "position": "con", "clarity": 8.5, "relevance": 8.0, "evidence_str": 7.5, "logic": 8.0, "persuasion": 8.2, "sentiment": "balanced"},
        ]

        for a in argument_data:
            arg = Argument(
                session_id=a["session"].id,
                speaker_id=a["speaker"].id,
                content=a["content"],
                claim=a["claim"],
                evidence=a["evidence"],
                position=a["position"],
                turn_number=1,
                clarity_score=a["clarity"],
                relevance_score=a["relevance"],
                evidence_strength=a["evidence_str"],
                logical_consistency=a["logic"],
                persuasiveness=a["persuasion"],
                sentiment=a["sentiment"],
                keywords=",".join(random.sample(["AI", "education", "technology", "policy", "ethics", "innovation", "reform", "impact", "future", "progress"], 4)),
                llm_analysis=json.dumps({"analysis": "Analyzed via LLM pipeline", "coherence": "high", "structure": "claim-evidence-impact"}),
                created_at=now,
            )
            db.add(arg)
            db.flush()

        # ============================================================
        # 4. PRESENTATIONS (6 analyses)
        # ============================================================
        presentation_data = [
            {"user": alice, "title": "The Future of AI in Education", "transcript": "AI is transforming education fundamentally. Um, it can, you know, help students learn at their own pace. Basically, the technology is, like, really powerful. Studies show that students using AI tutors perform significantly better than those in traditional classrooms. The evidence is clear and the results are compelling. We must embrace this technology for the benefit of all students. Thank you.", "pace": 145, "fillers": 8, "confidence": 7.2, "clarity": 8.0, "engagement": 7.5, "emotion": "passionate", "pitch": 6.5, "overall": 7.6},
            {"user": alice, "title": "Why Democracy Needs Critical Thinking", "transcript": "In today's world, critical thinking is more important than ever. We are bombarded with misinformation and propaganda. But, um, we have tools to fight back. Education systems must prioritize teaching students how to evaluate sources, identify logical fallacies, and construct sound arguments. This is not optional — it's essential for democracy to survive. I believe we can do this if we work together. Let's make it happen.", "pace": 138, "fillers": 5, "confidence": 8.0, "clarity": 8.5, "engagement": 8.2, "emotion": "confident", "pitch": 7.0, "overall": 8.1},
            {"user": bob, "title": "Coaching Strategies for Novice Debaters", "transcript": "When coaching beginners, you need to focus on fundamentals. Structure is everything. Claim, evidence, impact — that's the framework they need to master first. Umm, then you can introduce more advanced concepts like framing and narrative. The key is to create a safe environment where they can fail and learn. Every great debater started somewhere. My approach emphasizes practice over theory.", "pace": 155, "fillers": 6, "confidence": 8.5, "clarity": 9.0, "engagement": 8.0, "emotion": "confident", "pitch": 7.5, "overall": 8.4},
            {"user": carol, "title": "Integrating Debate Across the Curriculum", "transcript": "I firmly believe debate should not be confined to extracurricular activities. It should be integrated into every subject. History, science, literature — all of them benefit from structured argumentation. Like, students learn better when they have to defend their ideas with evidence and reasoning. The research supports this approach wholeheartedly. It's about time we rethink how we teach.", "pace": 140, "fillers": 4, "confidence": 8.8, "clarity": 8.5, "engagement": 8.5, "emotion": "passionate", "pitch": 7.2, "overall": 8.5},
            {"user": dave, "title": "Platform Overview and Growth Metrics", "transcript": "I want to share some exciting numbers with you today. Our platform has grown by 300% in the last quarter. We have over 10,000 active users across 45 countries. Basically, the demand for debate training is exploding. The AI-powered features are our biggest differentiator. Users who complete at least three debates improve their scores by an average of 25%. These are incredible results.", "pace": 160, "fillers": 3, "confidence": 9.0, "clarity": 9.2, "engagement": 8.5, "emotion": "confident", "pitch": 8.0, "overall": 8.8},
            {"user": emma, "title": "My First Presentation Journey", "transcript": "Um, so this is my first presentation. I'm a bit nervous honestly. But, uh, I want to talk about why I joined debate club. Like, I was really shy before. I couldn't speak in front of people. But, you know, debate has helped me find my voice. It's still hard sometimes. But I'm getting better every day. That's, um, all I wanted to say. Thank you for listening.", "pace": 120, "fillers": 12, "confidence": 5.0, "clarity": 6.5, "engagement": 6.0, "emotion": "nervous", "pitch": 4.5, "overall": 5.7},
        ]

        for p in presentation_data:
            pres = PresentationAnalysis(
                user_id=p["user"].id,
                title=p["title"],
                transcript=p["transcript"],
                duration_seconds=len(p["transcript"].split()) * 5,
                speech_pace=p["pace"],
                filler_word_count=p["fillers"],
                filler_words_detail=json.dumps({"um": 3, "like": 2, "you know": 1, "basically": 1, "uh": 1}),
                confidence_score=p["confidence"],
                clarity_score=p["clarity"],
                engagement_score=p["engagement"],
                emotion_detected=p["emotion"],
                pitch_variation=p["pitch"],
                pause_frequency=round(random.uniform(1.0, 5.0), 2),
                overall_score=p["overall"],
                feedback=f"Speech pace: {p['pace']} wpm. Filler words: {p['fillers']}. Overall score: {p['overall']}/10. {'Great job! Keep refining your delivery.' if p['overall'] >= 7 else 'Focus on reducing filler words and building confidence.'}",
                llm_coaching=json.dumps({
                    "coaching_tips": ["Vary your vocal pitch for emphasis", "Use strategic pauses before key points", "Reduce filler words with practice", "Structure arguments with claim-evidence-impact"],
                    "strengths": ["Clear articulation of main points", "Good use of examples"],
                    "improvement_areas": ["Filler word reduction", "Vocal variety"]
                }),
                created_at=now,
            )
            db.add(pres)
            db.flush()

        # ============================================================
        # 5. DEBATE SCORES (6 records with percentiles)
        # ============================================================
        score_data = [
            {"session": created_debates[0], "user": alice, "arg_qual": 8.0, "evidence": 7.5, "logic": 8.2, "rebuttal": 7.0, "comm": 8.5, "overall": 7.9, "feedback": "Excellent use of evidence and logical structure. Your opening was strong and persuasive. Work on directly addressing counterarguments for even higher scores."},
            {"session": created_debates[0], "user": bob, "arg_qual": 9.0, "evidence": 8.0, "logic": 8.8, "rebuttal": 8.5, "comm": 9.0, "overall": 8.7, "feedback": "Masterful performance. Your rebuttals were sharp and your delivery was compelling. One of the best performances we've seen this quarter."},
            {"session": created_debates[1], "user": alice, "arg_qual": 8.5, "evidence": 9.0, "logic": 8.0, "rebuttal": 7.5, "comm": 8.2, "overall": 8.3, "feedback": "Strong evidence base and passionate delivery. Your statistics were well-chosen and impactful. Continue developing your rebuttal skills."},
            {"session": created_debates[1], "user": bob, "arg_qual": 7.5, "evidence": 7.0, "logic": 8.0, "rebuttal": 7.5, "comm": 7.8, "overall": 7.6, "feedback": "Good measured approach. Your balanced perspective was refreshing. Try to incorporate more specific data points to strengthen your arguments."},
            {"session": created_debates[4], "user": dave, "arg_qual": 8.5, "evidence": 8.5, "logic": 8.0, "rebuttal": 8.0, "comm": 8.5, "overall": 8.3, "feedback": "Compelling argument with strong emotional resonance. Your evidence was solid and your delivery was confident. Excellent work."},
            {"session": created_debates[4], "user": alice, "arg_qual": 7.0, "evidence": 6.5, "logic": 7.5, "rebuttal": 6.5, "comm": 7.8, "overall": 7.1, "feedback": "Good balanced perspective on a complex issue. Work on backing up your claims with more concrete evidence and addressing counterarguments more directly."},
        ]

        all_overall_scores = [s["overall"] for s in score_data]
        for s in score_data:
            score = DebateScore(
                session_id=s["session"].id,
                user_id=s["user"].id,
                argument_quality=s["arg_qual"],
                evidence_usage=s["evidence"],
                logical_consistency=s["logic"],
                rebuttal_effectiveness=s["rebuttal"],
                communication_skills=s["comm"],
                overall_score=s["overall"],
                percentile_rank=round(sum(1 for x in all_overall_scores if x < s["overall"]) / len(all_overall_scores) * 100, 1),
                feedback=s["feedback"],
                llm_feedback=json.dumps({"feedback": s["feedback"], "tips": ["Keep building on your strengths", "Focus on weaker areas identified", "Practice with varied topics"]}),
                created_at=now,
            )
            db.add(score)
            db.flush()

        # ============================================================
        # 6. AI DEBATE SESSIONS (4 sessions)
        # ============================================================
        ai_sessions_data = [
            {"user": alice, "topic": "Should autonomous weapons be banned?", "position": "pro", "turns": 6, "score": 7.8, "history": [
                {"role": "ai", "position": "con", "content": "Autonomous weapons reduce human casualties by removing soldiers from dangerous situations.", "turn": 0},
                {"role": "user", "position": "pro", "content": "Machines making life-and-death decisions violate fundamental ethical principles.", "turn": 1},
                {"role": "ai", "position": "con", "content": "But human soldiers make errors too — machines can be more precise and objective.", "turn": 2},
            ]},
            {"user": alice, "topic": "Is capitalism the best economic system?", "position": "con", "turns": 4, "score": 6.5, "history": []},
            {"user": emma, "topic": "Should schools ban smartphones?", "position": "pro", "turns": 8, "score": 8.2, "history": []},
            {"user": henry, "topic": "Is genetic engineering ethically justified?", "position": "pro", "turns": 6, "score": 7.0, "history": []},
        ]

        for a in ai_sessions_data:
            session = AIDebateSession(
                user_id=a["user"].id,
                topic=a["topic"],
                user_position=a["position"],
                debate_format=DebateFormat.ai_simulation,
                turn_count=a["turns"],
                conversation_history=json.dumps(a["history"] or []),
                final_score=a["score"],
                status="completed",
                created_at=now,
            )
            db.add(session)
            db.flush()

        # ============================================================
        # 7. SKILL RECORDS (tracking skill progression)
        # ============================================================
        skill_names = ["argumentation", "delivery", "logic", "rebuttal", "clarity"]
        for uid in [alice.id, bob.id, carol.id, dave.id, emma.id, frank.id, henry.id, karen.id, leo.id]:
            for skill in skill_names:
                for _ in range(random.randint(2, 6)):
                    db.add(SkillRecord(
                        user_id=uid,
                        skill_name=skill,
                        score=round(random.uniform(4.0, 9.5), 1),
                        recorded_at=now,
                    ))
        db.flush()

        # ============================================================
        # 8. NOTIFICATIONS (varied types)
        # ============================================================
        extra_notifications = [
            {"user": alice, "title": "New Argument Analysis Available", "message": "Your argument in the AI vs Teachers debate has been analyzed. 1 fallacy detected.", "type": "info"},
            {"user": alice, "title": "Practice Reminder", "message": "You haven't practiced in 3 days. Keep your streak alive!", "type": "reminder"},
            {"user": alice, "title": "Score Milestone Reached!", "message": "Congratulations! Your average debate score has reached 8.0 — a new personal best!", "type": "milestone"},
            {"user": bob, "title": "New Student Assigned", "message": "A new learner has been assigned to your coaching roster.", "type": "info"},
            {"user": carol, "title": "Curriculum Update Available", "message": "New debate curriculum resources are available for educators.", "type": "info"},
            {"user": emma, "title": "Welcome! Start Your First Debate", "message": "Complete your first debate to unlock personalized coaching.", "type": "info"},
            {"user": frank, "title": "Law School Prep Tip", "message": "Based on your goals, we recommend focusing on policy debate format.", "type": "info"},
            {"user": grace, "title": "Team Performance Report Ready", "message": "Your debate team's monthly performance report is now available.", "type": "milestone"},
            {"user": henry, "title": "Rebuttal Skill Alert", "message": "Your rebuttal scores are below average. Check the coaching plan for exercises.", "type": "alert"},
            {"user": iris, "title": "Beginner Workshop Available", "message": "Join our weekly beginner debate workshop every Saturday.", "type": "reminder"},
        ]
        for n in extra_notifications:
            db.add(Notification(
                user_id=n["user"].id,
                title=n["title"],
                message=n["message"],
                notification_type=n["type"],
                channel="in_app",
                created_at=now,
            ))
        db.flush()

        # ============================================================
        # 9. AGENT RUNS (simulating AI pipeline)
        # ============================================================
        agent_types_list = ["speech", "argument", "fallacy", "scoring", "coach", "rebuttal"]
        for _ in range(15):
            db.add(AgentRun(
                session_id=random.choice(created_debates).id if random.random() > 0.3 else None,
                agent_type=random.choice(agent_types_list),
                input_data=json.dumps({"text": "Sample input for agent processing"}),
                output_data=json.dumps({"result": "Analysis complete", "score": round(random.uniform(5.0, 9.0), 2)}),
                llm_provider="mock",
                tokens_used=random.randint(50, 500),
                latency_ms=random.randint(100, 2000),
                status="completed",
                created_at=now,
            ))
        db.flush()

        # ============================================================
        # 10. AUDIT LOGS
        # ============================================================
        audit_actions = [
            ("POST", "/auth/register", 201), ("POST", "/auth/login", 200),
            ("POST", "/debates/", 201), ("POST", "/arguments/", 201),
            ("POST", "/presentations/", 201), ("POST", "/scores/debate", 201),
            ("POST", "/ai-debate/start", 201), ("POST", "/ai-debate/turn", 200),
            ("POST", "/ai-debate/end/1", 200), ("PUT", "/profile/", 200),
            ("PATCH", "/notifications/1/read", 200), ("GET", "/dashboard/learner", 200),
        ]
        for action, resource, status_code in audit_actions:
            db.add(AuditLog(
                user_id=random.choice(created_users).id,
                action=action,
                resource=resource,
                ip_address=f"192.168.1.{random.randint(2, 254)}",
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0",
                status_code=status_code,
                created_at=now,
            ))
        db.flush()

        # ============================================================
        # 11. COACHING PLANS (for key users)
        # ============================================================
        coaching_plans = [
            {"user": alice, "focus": "rebuttal,evidence_usage", "weekly": "Practice 3 rebuttal drills and 2 timed speeches", "exercises": ["Spend 15 minutes daily on impromptu speaking", "Analyze one professional debate per week", "Practice rebuttal drills with a partner", "Record and review your practice sessions", "Focus on evidence integration in arguments"], "path": ["Master claim-evidence-impact structure", "Achieve 7.5+ in all scoring dimensions", "Win a competitive debate match", "Coach a beginner through one debate", "Compete in a regional tournament"]},
            {"user": bob, "focus": "advanced_coaching,mentorship", "weekly": "Conduct 2 coaching sessions and review 5 student debates", "exercises": ["Develop new debate training modules", "Host a workshop on advanced argumentation", "Create feedback templates for students"], "path": ["Certify 5 new debaters", "Develop coaching methodology guide", "Launch a debate training webinar series", "Build a community of practice for coaches"]},
            {"user": emma, "focus": "confidence_building,fundamentals", "weekly": "Complete 2 practice debates and 1 presentation submission", "exercises": ["Practice 5-minute impromptu speeches", "Use filler word tracking app during practice", "Join a supportive beginner debate group", "Watch and analyze one expert debate per week"], "path": ["Complete 5 practice debates", "Reduce filler words to under 5 per speech", "Achieve 6.0+ confidence score", "Participate in a friendly competition", "Mentor a new beginner"]},
        ]
        for cp in coaching_plans:
            plan = CoachingPlan(
                user_id=cp["user"].id,
                focus_areas=cp["focus"],
                weekly_goals=cp["weekly"],
                recommended_exercises=json.dumps(cp["exercises"]),
                learning_path=json.dumps(cp["path"]),
                generated_by="llm",
                last_updated=now,
            )
            db.add(plan)
        db.flush()

        db.commit()
        print(f"[OK] Database seeded: {len(created_users)} users, {len(created_debates)} debates, {len(argument_data)} arguments, {len(presentation_data)} presentations, {len(score_data)} scores, {len(ai_sessions_data)} AI debates | password: password123")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seed failed: {e}")
        raise
    finally:
        db.close()


seed_database()
