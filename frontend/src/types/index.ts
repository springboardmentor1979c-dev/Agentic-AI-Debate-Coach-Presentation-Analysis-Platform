// ── Auth ──────────────────────────────────────────────────────────────────────
export interface UserRegister {
  name: string;
  email: string;
  password: string;
  role: 'learner' | 'coach' | 'educator' | 'admin';
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  role: string;
  user_id: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  last_login: string | null;
  created_at: string;
}

// ── Profile ───────────────────────────────────────────────────────────────────
export interface Profile {
  id: number;
  user_id: number;
  experience_level: string;
  goals: string;
  preferred_topics: string;
  coaching_preferences: string;
  presentation_domains: string;
  debate_count: number;
  presentation_count: number;
  avg_debate_score: number;
  avg_presentation_score: number;
  total_practice_minutes: number;
  streak_days: number;
}

export interface ProfileUpdate {
  experience_level?: string;
  goals?: string;
  preferred_topics?: string;
  coaching_preferences?: string;
  presentation_domains?: string;
}

// ── Debate ────────────────────────────────────────────────────────────────────
export interface DebateSession {
  id: number;
  topic: string;
  format: string;
  creator_id: number;
  status: string;
  scheduled_at: string | null;
  duration_minutes: number;
  created_at: string;
}

export interface DebateCreate {
  topic: string;
  format: string;
  scheduled_at?: string;
  participant_ids?: string;
}

// ── Argument ──────────────────────────────────────────────────────────────────
export interface Argument {
  id: number;
  session_id: number;
  speaker_id: number;
  content: string;
  claim: string;
  evidence: string;
  position: string;
  clarity_score: number;
  relevance_score: number;
  evidence_strength: number;
  logical_consistency: number;
  persuasiveness: number;
  sentiment: string;
  keywords: string;
  created_at?: string;
}

export interface ArgumentCreate {
  session_id: number;
  content: string;
  claim: string;
  evidence: string;
  position: string;
}

// ── Fallacy ───────────────────────────────────────────────────────────────────
export interface Fallacy {
  id: number;
  argument_id: number;
  fallacy_type: string;
  explanation: string;
  correction: string;
  confidence: number;
  detected_by: string;
}

// ── Counterargument ───────────────────────────────────────────────────────────
export interface Counterargument {
  id: number;
  argument_id: number;
  counter_type: string;
  content: string;
  strategy: string;
  generated_by: string;
}

// ── Presentation ──────────────────────────────────────────────────────────────
export interface Presentation {
  id: number;
  user_id: number;
  title: string;
  speech_pace: number;
  filler_word_count: number;
  confidence_score: number;
  clarity_score: number;
  engagement_score: number;
  emotion_detected: string;
  pitch_variation: number;
  overall_score: number;
  feedback: string;
  created_at: string;
}

export interface PresentationCreate {
  title: string;
  transcript: string;
  audio?: File;
}

// ── AI Debate ─────────────────────────────────────────────────────────────────
export interface AIDebateStart {
  session_id: number;
  topic: string;
  your_position: string;
  ai_position: string;
  ai_opening: string;
  instructions: string;
}

export interface AIDebateTurn {
  turn: number;
  ai_response: string;
  strategy: string;
  total_turns: number;
  tip: string | null;
}

export interface AIDebateEnd {
  session_id: number;
  topic: string;
  turns_completed: number;
  final_score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface AIDebateHistory {
  id: number;
  topic: string;
  position: string;
  turns: number;
  score: number | null;
  status: string;
  created_at: string;
}

// ── Scoring ───────────────────────────────────────────────────────────────────
export interface DebateScore {
  id: number;
  session_id: number;
  user_id: number;
  argument_quality: number;
  evidence_usage: number;
  logical_consistency: number;
  rebuttal_effectiveness: number;
  communication_skills: number;
  overall_score: number;
  percentile_rank: number;
  feedback: string;
  created_at: string;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export interface LearnerDashboard {
  user: string;
  role: string;
  debate_count: number;
  avg_debate_score: number;
  presentation_count: number;
  avg_presentation_score: number;
  ai_debate_sessions: number;
  performance_trend: string;
  recent_scores: { session_id: number; score: number; date: string }[];
  recent_presentations: { id: number; title: string; score: number }[];
}

export interface CoachDashboard {
  sessions_created: number;
  total_evaluations: number;
  students_tracked: number;
  avg_platform_score: number;
  student_summaries: { user_id: number; sessions: number; avg_score: number }[];
}

export interface AdminDashboard {
  total_users: number;
  by_role: { learner: number; coach: number; educator: number; admin: number };
  active_users: number;
  total_sessions: number;
  total_presentations: number;
  total_ai_debates: number;
  ai_agent_runs: number;
  total_tokens_used: number;
  audit_log_count: number;
}

// ── Coaching ──────────────────────────────────────────────────────────────────
export interface CoachingPlan {
  focus_areas: string[];
  weekly_goals: string;
  recommended_exercises: string[];
  learning_path: string[];
  motivational_message: string;
  current_stats: {
    avg_debate_score: number;
    avg_presentation_score: number;
    sessions: number;
  };
}

export interface SkillData {
  skills: Record<string, { score: number; date: string }[]>;
  total_records: number;
}

// ── Notification ──────────────────────────────────────────────────────────────
export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  channel: string;
  is_read: boolean;
  created_at: string;
}

