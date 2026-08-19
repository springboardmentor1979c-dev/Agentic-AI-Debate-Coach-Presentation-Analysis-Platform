export default function Testimonials() {
  return (
    <section className="max-w-7xl mx-auto px-10 py-24">
      <div className="text-center">
        <p className="text-blue-400 uppercase tracking-[0.3em] text-sm font-semibold">
          TESTIMONIALS
        </p>

        <h2 className="mt-4 text-4xl font-bold">
          Loved by Students & Professionals
        </h2>

        <p className="mt-5 text-slate-400 max-w-2xl mx-auto">
          Thousands of learners are improving their debate and presentation
          skills using Oratio AI.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-16">

        <div className="rounded-3xl bg-slate-900/50 border border-slate-800 p-6 hover:border-blue-500 hover:-translate-y-2 transition-all duration-300">
          <p className="text-slate-300 italic">
            "The AI feedback helped me improve my confidence before campus
            placements."
          </p>

          <div className="mt-6">
            <h4 className="font-bold">Rahul Sharma</h4>
            <p className="text-slate-400 text-sm">Engineering Student</p>
          </div>
        </div>

        <div className="rounded-3xl bg-slate-900/50 border border-slate-800 p-6 hover:border-blue-500 hover:-translate-y-2 transition-all duration-300">
          <p className="text-slate-300 italic">
            "I became much better at presentations after just two weeks."
          </p>

          <div className="mt-6">
            <h4 className="font-bold">Priya Verma</h4>
            <p className="text-slate-400 text-sm">MBA Student</p>
          </div>
        </div>

        <div className="rounded-3xl bg-slate-900/50 border border-slate-800 p-6 hover:border-blue-500 hover:-translate-y-2 transition-all duration-300">
          <p className="text-slate-300 italic">
            "A fantastic platform for practicing debates before competitions."
          </p>

          <div className="mt-6">
            <h4 className="font-bold">Aman Singh</h4>
            <p className="text-slate-400 text-sm">Public Speaker</p>
          </div>
        </div>

      </div>
    </section>
  );
}