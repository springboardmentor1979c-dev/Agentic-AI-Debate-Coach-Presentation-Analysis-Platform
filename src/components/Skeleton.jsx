import React from 'react';

const Skeleton = ({ className = '', variant = 'text' }) => {
  const base = "animate-pulse bg-slate-200 dark:bg-darkbg-accent";
  
  const variants = {
    text: "h-4 w-3/4 rounded-md",
    title: "h-6 w-1/2 rounded-md",
    circle: "h-12 w-12 rounded-full",
    rect: "h-32 w-full rounded-2xl",
    card: "h-48 w-full rounded-3xl",
  };

  return <div className={`${base} ${variants[variant]} ${className}`} />;
};

export default Skeleton;
