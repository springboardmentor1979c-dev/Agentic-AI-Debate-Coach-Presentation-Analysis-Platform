export default function Footer() {
  return (
    <footer className="border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-10 py-12 flex flex-col md:flex-row justify-between items-center">

        <div>
          <h2 className="text-2xl font-bold text-blue-500">
            Oratio AI
          </h2>

          <p className="text-slate-400 mt-2">
            AI Debate & Presentation Platform
          </p>
        </div>

        <div className="flex gap-8 mt-8 md:mt-0 text-slate-400">
          <a href="#">Features</a>
          <a href="#">Pricing</a>
          <a href="#">Resources</a>
          <a href="#">Contact</a>
        </div>

      </div>

      <div className="border-t border-slate-800 py-6 text-center text-slate-500 text-sm">
        © 2026 Oratio AI. All rights reserved.
      </div>
    </footer>
  );
}