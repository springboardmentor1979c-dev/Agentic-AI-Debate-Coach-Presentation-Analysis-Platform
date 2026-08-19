export default function Features() {
  return (
    <section className="max-w-7xl mx-auto px-10 py-24">
      <div className="text-center">
        <p className="text-blue-400 font-semibold uppercase tracking-[0.3em] text-sm">
          Features
        </p>

        <h2 className="mt-4 text-4xl font-bold">
          Everything You Need To Master Communication
        </h2>

        <p className="mt-5 text-slate-400 max-w-2xl mx-auto">
          Practice debates, analyze presentations, receive AI feedback,
          and improve your communication skills in one platform.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-16">

        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8 hover:border-blue-500 transition">
          <div className="text-sm font-semibold tracking-[0.2em] text-slate-500">
            01
          </div>

          <h3 className="mt-5 text-xl font-bold">
            AI Debate Coach
          </h3>

          <p className="mt-3 text-slate-400">
            Practice debates with real-time AI feedback and scoring.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8 hover:border-blue-500 transition">
          <div className="text-sm font-semibold tracking-[0.2em] text-slate-500">
            02
          </div>

          <h3 className="mt-5 text-xl font-bold">
            Presentation Analysis
          </h3>

          <p className="mt-3 text-slate-400">
            Analyze confidence, logic, clarity and delivery instantly.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8 hover:border-blue-500 transition">
          <div className="text-sm font-semibold tracking-[0.2em] text-slate-500">
            03
          </div>

          <h3 className="mt-5 text-xl font-bold">
            AI Recommendations
          </h3>

          <p className="mt-3 text-slate-400">
            Receive personalized suggestions to improve every session.
          </p>
        </div>

      </div>
    </section>
  );
}