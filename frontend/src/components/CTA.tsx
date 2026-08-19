import { useNavigate } from "react-router-dom";

export default function CTA() {
  const navigate = useNavigate();

  return (
    <section className="max-w-6xl mx-auto px-10 py-20">
      <div className="rounded-3xl border border-indigo-400/20 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 p-12 text-center shadow-2xl shadow-indigo-950/20">

        <h2 className="text-4xl font-bold">
          Ready to Become a Better Speaker?
        </h2>

        <p className="mt-5 text-slate-400 max-w-2xl mx-auto">
          Practice debates, receive AI feedback, and improve your communication
          skills with Oratio AI.
        </p>

        <button
          onClick={() => navigate("/signup")}
          className="mt-8 bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-4 rounded-xl font-medium transition-all shadow-lg shadow-indigo-950/30"
        >
          Start Practicing Free
        </button>

      </div>
    </section>
  );
}