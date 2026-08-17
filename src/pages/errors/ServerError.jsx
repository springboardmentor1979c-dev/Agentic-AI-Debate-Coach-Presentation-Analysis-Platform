import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';

const ServerError = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg-base flex items-center justify-center p-6 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-[20%] left-[10%] w-96 h-96 rounded-full bg-blue-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-96 h-96 rounded-full bg-purple-500/10 blur-[130px] pointer-events-none" />

      <Card variant="deep" className="max-w-md w-full text-center p-8 md:p-12 relative z-10" hoverEffect={false}>
        <div className="text-7xl mb-4 animate-pulse text-rose-500">
          ⚠️
        </div>
        <h1 className="font-display font-black text-4xl text-slate-900 dark:text-white mb-2">500</h1>
        <h2 className="font-display font-bold text-lg text-slate-800 dark:text-slate-200 mb-4">Internal Server Error</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
          The speech analysis engine encountered an unexpected computation error. Our systems team has been notified.
        </p>
        <Link to="/">
          <Button variant="outline" size="md" className="w-full">
            Back to Safety
          </Button>
        </Link>
      </Card>
    </div>
  );
};

export default ServerError;
