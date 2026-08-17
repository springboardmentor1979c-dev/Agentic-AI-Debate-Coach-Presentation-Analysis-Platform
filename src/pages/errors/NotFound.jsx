import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg-base flex items-center justify-center p-6 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-[20%] left-[10%] w-96 h-96 rounded-full bg-blue-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-96 h-96 rounded-full bg-purple-500/10 blur-[130px] pointer-events-none" />

      <Card variant="deep" className="max-w-md w-full text-center p-8 md:p-12 relative z-10" hoverEffect={false}>
        <div className="text-7xl mb-4 animate-bounce">
          🔍
        </div>
        <h1 className="font-display font-black text-4xl text-slate-900 dark:text-white mb-2">404</h1>
        <h2 className="font-display font-bold text-lg text-slate-800 dark:text-slate-200 mb-4">Page Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
          The debate motion or dashboard page you are seeking does not exist or has been archived. Check your route directory parameters.
        </p>
        <Link to="/">
          <Button variant="primary" size="md" className="w-full">
            Return to Arena Home
          </Button>
        </Link>
      </Card>
    </div>
  );
};

export default NotFound;
