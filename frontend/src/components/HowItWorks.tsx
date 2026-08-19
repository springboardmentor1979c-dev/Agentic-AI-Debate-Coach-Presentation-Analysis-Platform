export default function HowItWorks() {
  return (
    <section className="max-w-7xl mx-auto px-10 py-24">
      <div className="text-center">
        <p className="text-blue-400 uppercase tracking-[0.3em] text-sm font-semibold">
          HOW IT WORKS
        </p>

        <h2 className="mt-4 text-4xl font-bold">
          Improve Your Communication in 3 Steps
        </h2>

        <p className="mt-5 text-slate-400 max-w-2xl mx-auto">
          Practice, analyze and improve with AI in just a few minutes.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-16">

        <div className="rounded-3xl bg-slate-900/50 border border-slate-800 p-6 text-center hover:border-blue-500 transition-all duration-300">
          <div className="text-3xl font-semibold text-slate-500">
            01
          </div>

          <h3 className="mt-6 text-xl font-bold">
            1. Start Speaking
          </h3>

          <p className="mt-3 text-slate-400">
            Choose a debate or presentation topic and begin speaking.
          </p>
        </div>

        <div className="rounded-3xl bg-slate-900/50 border border-slate-800 p-8 text-center hover:border-blue-500 transition-all duration-300">
          <div className="text-3xl font-semibold text-slate-500">
            02
          </div>

          <h3 className="mt-6 text-xl font-bold">
            2. AI Analysis
          </h3>

          <p className="mt-3 text-slate-400">
            Our AI evaluates confidence, clarity, grammar and logic.
          </p>
        </div>

        <div className="rounded-3xl bg-slate-900/50 border border-slate-800 p-8 text-center hover:border-blue-500 transition-all duration-300">
          <div className="text-3xl font-semibold text-slate-500">
            03
          </div>

          <h3 className="mt-6 text-xl font-bold">
            3. Improve
          </h3>

          <p className="mt-3 text-slate-400">
            Receive personalized suggestions and track your progress.
          </p>
        </div>

      </div>
    </section>
  );
}