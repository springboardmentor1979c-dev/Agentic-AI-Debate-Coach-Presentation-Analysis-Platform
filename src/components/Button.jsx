import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost', 'danger', 'glass'
  size = 'md', // 'sm', 'md', 'lg'
  disabled = false,
  isLoading = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  const baseStyle = "relative inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs font-medium rounded-lg",
    md: "px-5 py-2.5 text-sm rounded-xl",
    lg: "px-7 py-3.5 text-base rounded-2xl",
  };

  const variants = {
    primary: "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-indigo-500/25",
    secondary: "bg-indigo-50 hover:bg-indigo-100 dark:bg-darkbg-accent dark:hover:bg-brand-950 dark:border dark:border-darkbg-border text-indigo-600 dark:text-brand-300",
    outline: "border-2 border-slate-200 dark:border-darkbg-border hover:bg-slate-100 dark:hover:bg-darkbg-accent text-slate-700 dark:text-slate-200",
    ghost: "hover:bg-slate-100 dark:hover:bg-darkbg-accent text-slate-600 dark:text-slate-300",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-red-500/20",
    glass: "glass-panel text-slate-800 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-brand-950/45",
  };

  return (
    <motion.button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      whileHover={disabled || isLoading ? {} : { scale: 1.02 }}
      whileTap={disabled || isLoading ? {} : { scale: 0.98 }}
      className={`${baseStyle} ${variants[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon ? (
        <Icon className="mr-2 h-4 w-4" />
      ) : null}
      {children}
    </motion.button>
  );
};

export default Button;
