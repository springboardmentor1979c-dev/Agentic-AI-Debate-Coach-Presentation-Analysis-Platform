import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  FileText,
  LogOut,
  MessageSquare,
  Moon,
  Presentation,
  Sun,
  TrendingUp,
  Flame,
} from "lucide-react";
import api from "../services/api";
import { getStreak } from "../services/streak";
import { useTheme } from "../hooks/useTheme";

type HistoryItem = {
  topic?: string;
  user_argument?: string;
  feedback?: string;
};

type StreakData = {
  current: number;
  longest: number;
};

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [streak, setStreak] = useState<StreakData>({
    current: 0,
    longest: 0,
  });

  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const [userResponse, historyResponse] = await Promise.all([
          api.get("/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          api.get("/history"),
        ]);

        setUser(userResponse.data);
        setHistory(historyResponse.data);
        setStreak(getStreak());
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [navigate]);

  const extractScore = (feedback: string | undefined) => {
    if (!feedback) return null;

    const match = feedback.match(
      /WEIGHTED PERFORMANCE SCORE\s*\n\s*(\d{1,3})\s*\/\s*100/i
    );

    if (!match) return null;

    const score = Number(match[1]);

    return score >= 0 && score <= 100 ? score : null;
  };

  const scores = useMemo(() => {
    return history
      .map((item) => extractScore(item.feedback))
      .filter((score): score is number => score !== null);
  }, [history]);

  const averageScore = useMemo(() => {
    if (scores.length === 0) return null;

    const total = scores.reduce((sum, score) => sum + score, 0);

    return Math.round(total / scores.length);
  }, [scores]);

  const recentSessions = history.slice(-4).reverse();

  const recommendation = useMemo(() => {
    if (history.length === 0) {
      return {
        title: "Start your first practice session",
        text:
          "Complete a debate or presentation so Oratio AI can begin building your communication profile.",
      };
    }

    const latestFeedback =
      history[history.length - 1]?.feedback || "";

    const metrics = [
      {
        name: "Argument Quality",
        regex: /ARGUMENT QUALITY\s*\n\s*(\d{1,3})\s*\/\s*100/i,
        advice:
          "Strengthen your main claims and make sure each argument directly supports your position.",
      },
      {
        name: "Evidence Usage",
        regex: /EVIDENCE USAGE\s*\n\s*(\d{1,3})\s*\/\s*100/i,
        advice:
          "Support important claims with examples, facts, or clear reasoning instead of unsupported statements.",
      },
      {
        name: "Logical Consistency",
        regex: /LOGICAL CONSISTENCY\s*\n\s*(\d{1,3})\s*\/\s*100/i,
        advice:
          "Check the connection between your claims and conclusions and avoid unsupported assumptions.",
      },
      {
        name: "Rebuttal Effectiveness",
        regex:
          /REBUTTAL EFFECTIVENESS\s*\n\s*(\d{1,3})\s*\/\s*100/i,
        advice:
          "Respond directly to the opposing argument before introducing your own supporting points.",
      },
      {
        name: "Communication Skills",
        regex:
          /COMMUNICATION SKILLS\s*\n\s*(\d{1,3})\s*\/\s*100/i,
        advice:
          "Focus on concise wording, clear sentence structure, and confident delivery.",
      },
    ];

    const scoresFound = metrics
      .map((metric) => {
        const match = latestFeedback.match(metric.regex);

        if (!match) return null;

        return {
          name: metric.name,
          advice: metric.advice,
          score: Number(match[1]),
        };
      })
      .filter(
        (
          item
        ): item is {
          name: string;
          advice: string;
          score: number;
        } => item !== null
      );

    if (scoresFound.length === 0) {
      return {
        title: "Keep building consistency",
        text:
          "Complete another evaluated debate to receive more personalized coaching based on your performance.",
      };
    }

    const weakest = scoresFound.reduce((lowest, current) =>
      current.score < lowest.score ? current : lowest
    );

    return {
      title: `Focus on ${weakest.name}`,
      text: weakest.advice,
    };
  }, [history]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const dark = theme === "dark";

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

              <p
                className={`text-xs mt-1 tracking-[0.2em] uppercase ${
                  dark ? "text-slate-500" : "text-slate-500"
                }`}
              >
                Communication Intelligence
              </p>
            </div>

            <div className="flex items-center gap-3">

              {/* Theme toggle */}
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

              {/* Sign out */}
              <button
                onClick={handleLogout}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-all ${
                  dark
                    ? "border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-500"
                    : "border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300"
                }`}
              >
                <LogOut size={16} />
                Sign out
              </button>

            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-12">

        {/* Welcome */}
        <section className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-400">
            Workspace
          </p>

          <h2
            className={`mt-3 text-4xl md:text-5xl font-semibold tracking-tight ${
              dark ? "text-white" : "text-slate-900"
            }`}
          >
            Welcome back,{" "}
            {user ? user.username : "Loading"}
          </h2>

          <p
            className={`mt-4 max-w-2xl leading-7 ${
              dark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Practice, review your performance, and build stronger
            communication skills with guided AI feedback.
          </p>
        </section>

        {/* Statistics */}
        <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">

          {/* Debate Sessions */}
          <div
            className={`rounded-3xl border p-6 backdrop-blur-xl transition-all ${
              dark
                ? "border-slate-800 bg-slate-900/70 hover:border-indigo-400/30"
                : "border-slate-200 bg-white hover:border-indigo-300"
            }`}
          >
            <div className="flex items-center justify-between">

              <p
                className={`text-xs uppercase tracking-[0.16em] ${
                  dark ? "text-slate-500" : "text-slate-500"
                }`}
              >
                Debate Sessions
              </p>

              <MessageSquare
                size={18}
                className="text-slate-500"
              />

            </div>

            <p
              className={`mt-4 text-4xl font-semibold ${
                dark ? "text-white" : "text-slate-900"
              }`}
            >
              {history.length}
            </p>
          </div>

          {/* Evaluated Sessions */}
          <div
            className={`rounded-3xl border p-6 backdrop-blur-xl transition-all ${
              dark
                ? "border-slate-800 bg-slate-900/70 hover:border-indigo-400/30"
                : "border-slate-200 bg-white hover:border-indigo-300"
            }`}
          >
            <div className="flex items-center justify-between">

              <p
                className={`text-xs uppercase tracking-[0.16em] ${
                  dark ? "text-slate-500" : "text-slate-500"
                }`}
              >
                Evaluated Sessions
              </p>

              <BarChart3
                size={18}
                className="text-slate-500"
              />

            </div>

            <p
              className={`mt-4 text-4xl font-semibold ${
                dark ? "text-white" : "text-slate-900"
              }`}
            >
              {scores.length}
            </p>
          </div>

          {/* Average Score */}
          <div
            className={`rounded-3xl border p-6 backdrop-blur-xl ${
              dark
                ? "border-indigo-400/20 bg-indigo-400/5"
                : "border-indigo-200 bg-indigo-50"
            }`}
          >
            <div className="flex items-center justify-between">

              <p
                className={`text-xs uppercase tracking-[0.16em] ${
                  dark ? "text-slate-500" : "text-slate-500"
                }`}
              >
                Average Performance
              </p>

              <TrendingUp
                size={18}
                className="text-indigo-500"
              />

            </div>

            <p className="mt-4 text-4xl font-semibold text-indigo-500">
              {averageScore !== null
                ? `${averageScore}%`
                : "—"}
            </p>
          </div>

          {/* Practice Streak */}
          <div
            className={`rounded-3xl border p-6 backdrop-blur-xl ${
              dark
                ? "border-indigo-400/20 bg-indigo-400/5"
                : "border-indigo-200 bg-indigo-50"
            }`}
          >
            <div className="flex items-center justify-between">

              <p
                className={`text-xs uppercase tracking-[0.16em] ${
                  dark ? "text-slate-500" : "text-slate-500"
                }`}
              >
                Practice Streak
              </p>

              <Flame
                size={18}
                className="text-indigo-500"
              />

            </div>

            <div className="mt-4 flex items-end gap-2">

              <p className="text-4xl font-semibold text-indigo-500">
                {streak.current}
              </p>

              <p
                className={`text-sm mb-1 ${
                  dark ? "text-slate-500" : "text-slate-500"
                }`}
              >
                {streak.current === 1 ? "day" : "days"}
              </p>

            </div>

            <p
              className={`mt-2 text-sm ${
                dark ? "text-slate-500" : "text-slate-500"
              }`}
            >
              Best: {streak.longest}{" "}
              {streak.longest === 1 ? "day" : "days"}
            </p>

          </div>

        </section>

        {/* Practice + Coaching */}
        <section className="grid lg:grid-cols-3 gap-6 mt-8">

          {/* Practice */}
          <div
            className={`lg:col-span-2 rounded-3xl border p-7 ${
              dark
                ? "border-slate-800 bg-slate-900/60"
                : "border-slate-200 bg-white"
            }`}
          >

            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Practice
              </p>

              <h3
                className={`mt-2 text-2xl font-semibold ${
                  dark ? "text-white" : "text-slate-900"
                }`}
              >
                Choose your next session
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-6">

              <button
                onClick={() => navigate("/debate")}
                className={`group rounded-2xl border p-6 text-left hover:-translate-y-1 transition-all ${
                  dark
                    ? "border-slate-800 bg-slate-950/70 hover:border-indigo-400/30"
                    : "border-slate-200 bg-slate-50 hover:border-indigo-300"
                }`}
              >
                <div className="h-10 w-10 rounded-xl border border-blue-500/20 bg-blue-500/10 flex items-center justify-center">
                  <MessageSquare
                    size={18}
                    className="text-blue-500"
                  />
                </div>

                <h4
                  className={`mt-5 text-lg font-semibold ${
                    dark ? "text-white" : "text-slate-900"
                  }`}
                >
                  New Debate Session
                </h4>

                <p
                  className={`mt-2 text-sm leading-6 ${
                    dark ? "text-slate-500" : "text-slate-600"
                  }`}
                >
                  Practice against an AI opponent and receive argument
                  analysis, fallacy detection, and coaching feedback.
                </p>

                <span className="mt-5 inline-flex items-center gap-2 text-sm text-blue-500">
                  Start session
                  <ArrowRight
                    size={15}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </span>
              </button>

              <button
                onClick={() => navigate("/presentation")}
                className={`group rounded-2xl border p-6 text-left hover:-translate-y-1 transition-all ${
                  dark
                    ? "border-slate-800 bg-slate-950/70 hover:border-indigo-400/30"
                    : "border-slate-200 bg-slate-50 hover:border-indigo-300"
                }`}
              >
                <div className="h-10 w-10 rounded-xl border border-violet-500/20 bg-violet-500/10 flex items-center justify-center">
                  <Presentation
                    size={18}
                    className="text-violet-500"
                  />
                </div>

                <h4
                  className={`mt-5 text-lg font-semibold ${
                    dark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Presentation Evaluation
                </h4>

                <p
                  className={`mt-2 text-sm leading-6 ${
                    dark ? "text-slate-500" : "text-slate-600"
                  }`}
                >
                  Upload presentation material or record your delivery
                  and receive structured communication feedback.
                </p>

                <span className="mt-5 inline-flex items-center gap-2 text-sm text-violet-500">
                  Start evaluation
                  <ArrowRight
                    size={15}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </span>
              </button>

            </div>

          </div>

          {/* Coaching Insight */}
          <div
            className={`rounded-3xl border p-7 ${
              dark
                ? "border-slate-800 bg-slate-900/60"
                : "border-slate-200 bg-white"
            }`}
          >

            <div className="flex items-start gap-3">

              <div
                className={`h-10 w-10 rounded-xl border flex items-center justify-center ${
                  dark
                    ? "border-indigo-400/20 bg-indigo-400/5"
                    : "border-indigo-200 bg-indigo-50"
                }`}
              >
                <BookOpen
                  size={18}
                  className="text-indigo-500"
                />
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Coaching Insight
                </p>

                <h3
                  className={`mt-2 text-lg font-semibold ${
                    dark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {recommendation.title}
                </h3>
              </div>

            </div>

            <p
              className={`mt-5 text-sm leading-7 ${
                dark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {recommendation.text}
            </p>

            <button
              onClick={() => navigate("/debate")}
              className="mt-6 inline-flex items-center gap-2 text-sm text-indigo-500 hover:text-indigo-400 transition-colors"
            >
              Practice now
              <ArrowRight size={15} />
            </button>

          </div>

        </section>

        {/* Recent Sessions */}
        <section
          className={`mt-8 rounded-3xl border p-7 ${
            dark
              ? "border-slate-800 bg-slate-900/60"
              : "border-slate-200 bg-white"
          }`}
        >

          <div className="flex items-center justify-between gap-4">

            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                History
              </p>

              <h3
                className={`mt-2 text-2xl font-semibold ${
                  dark ? "text-white" : "text-slate-900"
                }`}
              >
                Recent debate sessions
              </h3>
            </div>

            <button
              onClick={() => navigate("/history")}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-all ${
                dark
                  ? "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500 hover:text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              View all
              <ArrowRight size={15} />
            </button>

          </div>

          {recentSessions.length === 0 ? (
            <div
              className={`mt-6 rounded-2xl border border-dashed p-8 text-center ${
                dark
                  ? "border-slate-800 bg-slate-950/50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <FileText
                size={24}
                className="mx-auto text-slate-500"
              />

              <p className="mt-3 text-sm text-slate-500">
                Your recent sessions will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">

              {recentSessions.map((item, index) => {
                const score = extractScore(item.feedback);

                return (
                  <button
                    key={index}
                    onClick={() => navigate("/history")}
                    className={`w-full rounded-2xl border p-5 text-left transition-all ${
                      dark
                        ? "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">

                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                          Debate Session
                        </p>

                        <p
                          className={`mt-1 text-sm font-medium truncate ${
                            dark
                              ? "text-slate-200"
                              : "text-slate-800"
                          }`}
                        >
                          {item.topic || "Untitled session"}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs text-slate-500">
                          Score
                        </p>

                        <p className="mt-1 text-sm font-semibold text-indigo-500">
                          {score !== null
                            ? `${score}/100`
                            : "—"}
                        </p>
                      </div>

                    </div>
                  </button>
                );
              })}

            </div>
          )}

        </section>

      </main>
    </div>
  );
}