import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden max-w-7xl mx-auto px-10 py-32 grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center">

      <div className="absolute -top-20 -left-20 h-[450px] w-[450px] rounded-full bg-blue-500/15 blur-[150px]" />

      <div className="lg:col-span-1 max-w-3xl">

        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-300 mb-8">
          AI Powered Debate & Presentation Coach
        </div>

        <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
          Master Every Debate.
          <br />
          Elevate Every Presentation.
        </h1>

        <p className="text-slate-400 mt-6 text-lg max-w-xl leading-8">
          Train with AI that evaluates your arguments,
          speaking confidence, clarity, logic, and presentation
          delivery in real time.
        </p>

        <div className="flex gap-4 mt-10">

          <button
            onClick={() => navigate("/signup")}
            className="bg-blue-600 px-6 py-3 rounded-xl hover:bg-blue-700 transition"
          >
            Get Started
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="border border-slate-700 px-6 py-3 rounded-xl hover:border-blue-500 transition"
          >
            Watch Demo
          </button>

        </div>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-800 p-8 shadow-2xl max-w-xl ml-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-indigo-300 text-sm">AI Analysis</p>
            <h2 className="text-3xl font-bold mt-1">
              Overall Score
            </h2>
          </div>

          <div className="h-20 w-20 rounded-full border-2 border-indigo-400/80 bg-indigo-400/5 shadow-[0_0_30px_rgba(129,140,248,0.18)] flex items-center justify-center text-2xl font-semibold">
            94
          </div>
        </div>

        <div className="space-y-5">

          <div>
            <div className="flex justify-between mb-1">
              <span>Confidence</span>
              <span>92%</span>
            </div>

            <div className="h-2 rounded-full bg-slate-800">
              <div className="h-2 rounded-full bg-indigo-400 w-[92%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span>Logic</span>
              <span>95%</span>
            </div>

            <div className="h-2 rounded-full bg-slate-800">
              <div className="h-2 rounded-full bg-indigo-400 w-[95%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span>Communication</span>
              <span>89%</span>
            </div>

            <div className="h-2 rounded-full bg-slate-800">
              <div className="h-2 rounded-full bg-indigo-400 w-[89%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span>Grammar</span>
              <span>90%</span>
            </div>

            <div className="h-2 rounded-full bg-slate-800">
              <div className="h-2 rounded-full bg-indigo-400 w-[90%]" />
            </div>
          </div>

        </div>

        <div className="mt-8 rounded-2xl bg-indigo-400/5 border border-indigo-400/15 p-4">
          <p className="text-indigo-300 font-medium">
            AI Recommendation
          </p>

          <p className="text-slate-300 mt-2 text-sm">
            Improve rebuttal clarity and maintain eye contact to increase your debate score.
          </p>
        </div>

      </div>

    </section>
  );
}