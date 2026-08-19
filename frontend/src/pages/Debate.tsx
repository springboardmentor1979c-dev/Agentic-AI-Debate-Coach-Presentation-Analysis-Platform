import { useState } from "react";
import api from "../services/api";
import {
  MessageSquare,
  Play,
  Send,
  Loader2,
  RotateCcw,
  FileText,
  RefreshCw,
  BarChart3,
  HelpCircle,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "../hooks/useTheme";

const debateFormats = [
  "One-on-One",
  "Parliamentary",
  "Oxford",
  "Policy",
  "Public Forum",
];

export default function Debate() {
  const [topic, setTopic] = useState("");
  const [debateFormat, setDebateFormat] = useState("One-on-One");

  const [response, setResponse] = useState("");
  const [userResponse, setUserResponse] = useState("");
  const [feedback, setFeedback] = useState("");

  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [continuing, setContinuing] = useState(false);

  const [round, setRound] = useState(1);
  const [debateHistory, setDebateHistory] = useState("");

  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  const startDebate = async () => {
    if (!topic.trim()) {
      alert("Enter a debate topic first.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/debate", {
        topic,
        debate_format: debateFormat,
      });

      const aiArgument = res.data.response;

      setResponse(aiArgument);
      setFeedback("");
      setUserResponse("");
      setRound(1);

      setDebateHistory(
        `Round 1 - AI Argument:
${aiArgument}`
      );
    } catch (error: any) {
      console.error("Debate Error:", error);
      console.error("Response:", error.response);

      alert(
        error.response?.data?.detail ||
          error.message ||
          "Failed to generate debate."
      );
    } finally {
      setLoading(false);
    }
  };

  const continueDebate = async () => {
    if (!userResponse.trim()) {
      alert("Write your rebuttal before continuing the debate.");
      return;
    }

    setContinuing(true);

    try {
      const res = await api.post("/debate/continue", {
        topic,
        debate_history: debateHistory,
        user_argument: userResponse,
        debate_format: debateFormat,
      });

      const nextAiResponse = res.data.response;
      const nextRound = round + 1;

      setResponse(nextAiResponse);
      setUserResponse("");
      setFeedback("");
      setRound(nextRound);

      setDebateHistory(
        `${debateHistory}

Round ${nextRound - 1} - User Rebuttal:
${userResponse}

Round ${nextRound} - AI Response:
${nextAiResponse}`
      );
    } catch (error: any) {
      console.error("Continue Debate Error:", error);
      console.error("Response:", error.response);

      alert(
        error.response?.data?.detail ||
          error.message ||
          "Failed to continue debate."
      );
    } finally {
      setContinuing(false);
    }
  };

  const evaluateResponse = async () => {
    if (!userResponse.trim()) {
      alert("Write your rebuttal before submitting it.");
      return;
    }

    setEvaluating(true);

    try {
      const res = await api.post("/evaluate", {
        topic,
        ai_argument: response,
        user_argument: userResponse,
        debate_format: debateFormat,
      });

      setFeedback(res.data.feedback);

      setTimeout(() => {
        document
          .getElementById("evaluation-report")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 150);
    } catch (error: any) {
      console.error("Evaluate Error:", error);
      console.error("Response:", error.response);

      alert(
        error.response?.data?.detail ||
          error.message ||
          "Failed to evaluate response."
      );
    } finally {
      setEvaluating(false);
    }
  };

  const resetDebate = () => {
    setTopic("");
    setDebateFormat("One-on-One");
    setResponse("");
    setUserResponse("");
    setFeedback("");
    setDebateHistory("");
    setRound(1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const extractScore = (label: string): number | null => {
    if (!feedback) return null;

    const regex = new RegExp(
      `${label}\\s*\\n?\\s*(\\d{1,3})\\s*/\\s*100`,
      "i"
    );

    const match = feedback.match(regex);

    if (!match) return null;

    const score = Number(match[1]);

    return score >= 0 && score <= 100 ? score : null;
  };

  const weightedScore = extractScore(
    "WEIGHTED PERFORMANCE SCORE"
  );

  const argumentQuality = extractScore(
    "ARGUMENT QUALITY"
  );

  const evidenceUsage = extractScore(
    "EVIDENCE USAGE"
  );

  const logicalConsistency = extractScore(
    "LOGICAL CONSISTENCY"
  );

  const rebuttalEffectiveness = extractScore(
    "REBUTTAL EFFECTIVENESS"
  );

  const communicationSkills = extractScore(
    "COMMUNICATION SKILLS"
  );

  const extractSection = (
    heading: string,
    nextHeading: string
  ) => {
    if (!feedback) return "";

    const regex = new RegExp(
      `${heading}[\\s\\S]*?(?=${nextHeading}|$)`,
      "i"
    );

    const match = feedback.match(regex);

    if (!match) return "";

    return match[0]
      .replace(new RegExp(`^${heading}\\s*`, "i"), "")
      .trim();
  };

  const challengeQuestion = extractSection(
    "CHALLENGE QUESTION",
    "STRENGTHS"
  );

  const renderScoreCard = (
    label: string,
    score: number | null,
    highlight = false
  ) => (
    <div
      className={`rounded-2xl border p-5 ${
        highlight
          ? dark
            ? "border-indigo-400/30 bg-indigo-400/5"
            : "border-indigo-200 bg-indigo-50"
          : dark
          ? "border-slate-800 bg-slate-950/70"
          : "border-slate-200 bg-white"
      }`}
    >
      <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
        {label}
      </p>

      <div className="mt-3 flex items-end gap-1">
        <span
          className={`text-3xl font-semibold ${
            highlight
              ? "text-indigo-500"
              : dark
              ? "text-white"
              : "text-slate-900"
          }`}
        >
          {score !== null ? score : "—"}
        </span>

        {score !== null && (
          <span className="text-sm text-slate-500 mb-1">
            /100
          </span>
        )}
      </div>

      <div className="mt-4 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-indigo-400 transition-all duration-700"
          style={{ width: `${score ?? 0}%` }}
        />
      </div>
    </div>
  );

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        dark
          ? "bg-[#020817] text-white"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Header */}
      <header
        className={`border-b backdrop-blur-xl transition-colors duration-300 ${
          dark
            ? "border-slate-800/80 bg-[#020817]/90"
            : "border-slate-200 bg-white/90"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5">
          <div className="flex items-center justify-between gap-4">

            <div>
              <h1
                className={`text-2xl font-semibold tracking-wide ${
                  dark ? "text-white" : "text-slate-900"
                }`}
              >
                ORATIO AI
              </h1>

              <p className="text-xs text-slate-500 mt-1 tracking-[0.2em] uppercase">
                Communication Intelligence
              </p>
            </div>

            <div className="flex items-center gap-3">

              {response && (
                <span className="text-sm text-slate-500">
                  Round {round}
                </span>
              )}

              <span className="hidden sm:block text-sm text-slate-500">
                Debate Evaluation
              </span>

              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className={`inline-flex items-center justify-center h-10 w-10 rounded-xl border transition-all ${
                  dark
                    ? "border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-500"
                    : "border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300"
                }`}
              >
                {dark ? (
                  <Sun size={17} />
                ) : (
                  <Moon size={17} />
                )}
              </button>

            </div>

          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-12">

        {/* Intro */}
        <section className="max-w-3xl mb-10">

          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/5 px-3 py-1.5 text-xs text-indigo-400">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            Debate Practice
          </div>

          <h2
            className={`mt-5 text-4xl md:text-5xl font-semibold tracking-tight ${
              dark ? "text-white" : "text-slate-900"
            }`}
          >
            Build stronger arguments
            <span className="block text-slate-500">
              through structured debate practice.
            </span>
          </h2>

          <p
            className={`mt-5 leading-7 max-w-2xl ${
              dark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Practice against an AI opponent, respond to challenges,
            and evaluate the quality of your reasoning.
          </p>

        </section>

        {/* Topic + Format */}
        <section
          className={`rounded-3xl border backdrop-blur-xl p-7 ${
            dark
              ? "border-slate-800 bg-slate-900/60"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-start gap-4">

            <div className="h-11 w-11 rounded-xl border border-blue-500/20 bg-blue-500/10 flex items-center justify-center">
              <MessageSquare
                size={20}
                className="text-blue-500"
              />
            </div>

            <div>
              <h3
                className={`text-lg font-semibold ${
                  dark ? "text-white" : "text-slate-900"
                }`}
              >
                Debate setup
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Choose a topic and a debate format.
              </p>
            </div>

          </div>

          <div className="mt-7 grid lg:grid-cols-[1fr_260px] gap-4">

            <input
              type="text"
              placeholder="Example: Should artificial intelligence replace teachers?"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  startDebate();
                }
              }}
              className={`w-full rounded-2xl border px-5 py-4 text-sm outline-none transition-all ${
                dark
                  ? "border-slate-800 bg-slate-950/80 text-slate-200 placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                  : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100"
              }`}
            />

            <select
              value={debateFormat}
              onChange={(e) => setDebateFormat(e.target.value)}
              className={`w-full rounded-2xl border px-5 py-4 text-sm outline-none transition-all ${
                dark
                  ? "border-slate-800 bg-slate-950/80 text-slate-300 focus:border-indigo-400/50"
                  : "border-slate-200 bg-slate-50 text-slate-800 focus:border-indigo-300"
              }`}
            >
              {debateFormats.map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>

          </div>

          <div className="mt-5 flex flex-wrap gap-3">

            <button
              onClick={startDebate}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-400 disabled:text-slate-600 px-5 py-3 text-sm font-medium transition-all shadow-lg shadow-indigo-950/20"
            >
              {loading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play size={17} />
                  Start Debate
                </>
              )}
            </button>

            <button
              onClick={resetDebate}
              className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium transition-all ${
                dark
                  ? "border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              <RotateCcw size={16} />
              Reset
            </button>

          </div>
        </section>

        {/* AI Argument */}
        {response && (
          <section
            className={`mt-6 rounded-3xl border backdrop-blur-xl p-7 ${
              dark
                ? "border-slate-800 bg-slate-900/60"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-start gap-4">

              <div className="h-11 w-11 rounded-xl border border-violet-500/20 bg-violet-500/10 flex items-center justify-center">
                <FileText
                  size={20}
                  className="text-violet-500"
                />
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-violet-500">
                  AI Opponent
                </p>

                <h3
                  className={`mt-2 text-2xl font-semibold ${
                    dark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Round {round} Argument
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Format: {debateFormat}
                </p>
              </div>

            </div>

            <div
              className={`mt-7 rounded-2xl border p-6 ${
                dark
                  ? "border-slate-800 bg-slate-950/70"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <p
                className={`whitespace-pre-wrap text-sm leading-7 ${
                  dark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                {response}
              </p>
            </div>

          </section>
        )}

        {/* User Rebuttal */}
        {response && (
          <section
            className={`mt-6 rounded-3xl border backdrop-blur-xl p-7 ${
              dark
                ? "border-slate-800 bg-slate-900/60"
                : "border-slate-200 bg-white"
            }`}
          >

            <div className="flex items-start gap-4">

              <div className="h-11 w-11 rounded-xl border border-blue-500/20 bg-blue-500/10 flex items-center justify-center">
                <MessageSquare
                  size={20}
                  className="text-blue-500"
                />
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-blue-500">
                  Your Response
                </p>

                <h3
                  className={`mt-2 text-2xl font-semibold ${
                    dark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Write your rebuttal
                </h3>
              </div>

            </div>

            <textarea
              placeholder="Present your counterargument clearly and explain why your position is stronger..."
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              className={`w-full mt-7 min-h-52 resize-none rounded-2xl border px-5 py-4 text-sm leading-7 outline-none transition-all ${
                dark
                  ? "border-slate-800 bg-slate-950/80 text-slate-300 placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                  : "border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100"
              }`}
            />

            <div className="mt-5 flex flex-wrap justify-end gap-3">

              <button
                onClick={continueDebate}
                disabled={continuing}
                className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium transition-all ${
                  dark
                    ? "border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800 disabled:bg-slate-900"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:bg-slate-100"
                }`}
              >
                {continuing ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Generating Counter...
                  </>
                ) : (
                  <>
                    <RefreshCw size={17} />
                    Continue Debate
                  </>
                )}
              </button>

              <button
                onClick={evaluateResponse}
                disabled={evaluating}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-400 disabled:text-slate-600 px-5 py-3 text-sm font-medium transition-all shadow-lg shadow-indigo-950/20"
              >
                {evaluating ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    <Send size={17} />
                    Evaluate Rebuttal
                  </>
                )}
              </button>

            </div>

          </section>
        )}

        {/* Evaluation */}
        {feedback && (
          <section
            id="evaluation-report"
            className="mt-6"
          >

            <div className="flex items-end justify-between gap-4 mb-6">

              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-indigo-500">
                  Evaluation Report
                </p>

                <h3
                  className={`mt-2 text-3xl font-semibold ${
                    dark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Debate Performance
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Structured assessment based on the debate scoring model.
                </p>
              </div>

            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {renderScoreCard(
                "Weighted Performance",
                weightedScore,
                true
              )}

              {renderScoreCard(
                "Argument Quality",
                argumentQuality
              )}

              {renderScoreCard(
                "Evidence Usage",
                evidenceUsage
              )}

              {renderScoreCard(
                "Logical Consistency",
                logicalConsistency
              )}

              {renderScoreCard(
                "Rebuttal Effectiveness",
                rebuttalEffectiveness
              )}

              {renderScoreCard(
                "Communication Skills",
                communicationSkills
              )}

            </div>

            {/* Challenge Question */}
            <div
              className={`mt-6 rounded-3xl border p-7 ${
                dark
                  ? "border-indigo-400/20 bg-indigo-400/5"
                  : "border-indigo-200 bg-indigo-50"
              }`}
            >
              <div className="flex items-start gap-4">

                <div className="h-10 w-10 rounded-xl border border-indigo-400/20 bg-white/5 flex items-center justify-center">
                  <HelpCircle
                    size={19}
                    className="text-indigo-500"
                  />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-indigo-500">
                    Challenge Question
                  </p>

                  <h4
                    className={`mt-2 text-xl font-semibold ${
                      dark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Prepare for the next argument
                  </h4>

                  <p
                    className={`mt-4 text-sm leading-7 ${
                      dark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    {challengeQuestion ||
                      "The evaluation did not return a separate challenge question."}
                  </p>
                </div>

              </div>
            </div>

            {/* Detailed report */}
            <div
              className={`mt-6 rounded-3xl border backdrop-blur-xl p-7 ${
                dark
                  ? "border-slate-800 bg-slate-900/60"
                  : "border-slate-200 bg-white"
              }`}
            >

              <div className="flex items-center gap-3">

                <BarChart3
                  size={19}
                  className="text-indigo-500"
                />

                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Detailed analysis
                  </p>

                  <h4
                    className={`mt-1 text-xl font-semibold ${
                      dark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Argument & Coaching Report
                  </h4>
                </div>

              </div>

              <div
                className={`mt-6 rounded-2xl border p-6 ${
                  dark
                    ? "border-slate-800 bg-slate-950/70"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <pre
                  className={`whitespace-pre-wrap font-sans text-sm leading-7 ${
                    dark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {feedback}
                </pre>
              </div>

            </div>

          </section>
        )}

      </main>
    </div>
  );
}