# PDF Alignment Notes

This project now tracks the "Agentic AI Debate Coach & Presentation Analysis Platform" PDF closely.

## Implemented

- JWT registration/login and role-based access for learner, coach, educator, and admin users.
- User profile, goals, debate history, presentation history, and skill tracking.
- Debate session creation, scheduling fields, status management, and supported debate formats.
- Argument scoring for clarity, relevance, evidence strength, logical consistency, and persuasiveness.
- Logical fallacy detection with explanation and correction suggestions.
- Counterargument generation across logical, evidence, ethical, practical, and policy styles.
- Transcript-based presentation analytics for speech pace, filler words, confidence, clarity, engagement, emotion, and coaching feedback.
- AI debate simulation with multi-turn AI opponent flow.
- Weighted debate performance scoring using the PDF model: 30/20/20/15/15.
- Personalized coaching plans, recommendations, leaderboard, dashboards, notifications, reports, and exports.
- Agentic orchestration logs for speech, argument, fallacy, rebuttal, scoring, and coaching agents.
- FAISS semantic search, Redis cache hooks, Kafka event hooks, Prometheus metrics, Docker Compose, and Grafana.

## Improved Toward The PDF

- `DATABASE_URL` is now environment-driven, so SQLite remains the local default while PostgreSQL can be used for production-style deployment.
- Docker Compose now includes PostgreSQL and MongoDB services alongside Redis, Kafka, Prometheus, and Grafana.
- OAuth2 start endpoints now generate Google/GitHub authorization URLs when provider credentials are configured.
- Presentation submissions now support optional audio/video upload plus transcript-assisted analysis through `/presentations/upload`.
- Environment examples now expose OAuth, PostgreSQL, MongoDB, and speech transcription settings.

## Remaining Production Integrations

- Complete OAuth callback token exchange and provider user-info verification.
- Wire Whisper or another speech-to-text provider for transcript generation from raw audio/video.
- Persist raw media to S3 or another object store if long-term recording storage is required.
- Use MongoDB for unstructured transcripts, agent traces, or analytics events if required by the evaluator.
- Add CI/CD workflow and cloud deployment manifests for AWS or Azure.
