import React from 'react';
import { Link } from 'react-router-dom';
import { Award, AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#05020c] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="text-center z-10 space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-950/30 mx-auto mb-4">
          <Award className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-8xl font-extrabold tracking-tight text-white font-sans bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          404
        </h1>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Page Not Found</h2>
          <p className="text-slate-400 text-xs max-w-sm mx-auto font-light leading-relaxed">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs transition duration-200 shadow-md shadow-purple-950/20 glow-btn"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
