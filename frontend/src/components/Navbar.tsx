import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#020817]/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-5">

        <div>
          <h1 className="text-xl font-semibold tracking-[0.12em] text-white">
            ORATIO AI
          </h1>

          <p className="text-[10px] text-slate-500 tracking-[0.2em] uppercase mt-1">
            Communication Intelligence
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-all"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white transition-all shadow-lg shadow-indigo-950/30"
          >
            Start Free
          </Link>
        </div>

      </div>
    </nav>
  );
}