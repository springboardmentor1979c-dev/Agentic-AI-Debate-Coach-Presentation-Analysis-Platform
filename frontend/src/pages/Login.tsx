import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await api.post(
        "/login",
        new URLSearchParams({
          username: email,
          password: password,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      localStorage.setItem("token", response.data.access_token);

      navigate("/dashboard");
    } catch (error: any) {
      alert(error.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white flex items-center justify-center px-6 relative overflow-hidden">

      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-120px] left-[-100px] w-[320px] h-[320px] bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-140px] right-[-100px] w-[360px] h-[360px] bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center">

            <h1 className="text-4xl font-semibold tracking-[0.18em] text-white">
              ORATIO AI
            </h1>

            <div className="mt-3 h-px w-16 bg-gradient-to-r from-blue-500 to-violet-500" />

            <p className="mt-3 text-xs tracking-[0.24em] text-slate-500 uppercase">
              Communication Intelligence
            </p>

          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl p-8 shadow-2xl shadow-black/20">

          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h2>

            <p className="text-slate-400 mt-2 text-sm">
              Sign in to continue to your workspace.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Email
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-slate-950/80 border border-slate-700 px-4 py-3.5 text-white placeholder-slate-600 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-slate-950/80 border border-slate-700 px-4 py-3.5 text-white placeholder-slate-600 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40"
              />
            </div>

            {/* Login */}
            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 py-3.5 font-medium transition-all duration-200 shadow-lg shadow-blue-600/10"
            >
              Sign in
            </button>

          </form>

          {/* Signup */}
          <p className="mt-7 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Create one
            </Link>
          </p>

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-6">
          AI-powered communication practice and evaluation
        </p>

      </div>
    </div>
  );
}