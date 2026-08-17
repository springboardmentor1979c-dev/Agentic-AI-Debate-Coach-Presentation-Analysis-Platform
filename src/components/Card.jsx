import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hoverEffect = true,
  glow = false,
  variant = 'glass', // 'glass', 'flat', 'deep'
  onClick,
}) => {
  const isClickable = !!onClick;
  
  const variantStyles = {
    glass: "glass-panel shadow-sm border border-slate-200/50 dark:border-white/5",
    deep: "glass-panel-deep shadow-md border border-slate-200/80 dark:border-white/10",
    flat: "bg-white dark:bg-darkbg-card border border-slate-100 dark:border-darkbg-border shadow-sm",
  };

  const shadowGlow = glow ? "glow-purple hover:glow-blue transition-all duration-300" : "";
  const hoverClass = hoverEffect ? "hover:translate-y-[-2px] hover:shadow-lg dark:hover:shadow-indigo-500/5 transition-all duration-300" : "";
  const cursorClass = isClickable ? "cursor-pointer" : "";

  const containerProps = isClickable ? { onClick } : {};

  return (
    <motion.div
      className={`rounded-2xl p-6 overflow-hidden ${variantStyles[variant]} ${shadowGlow} ${hoverClass} ${cursorClass} ${className}`}
      whileHover={isClickable && hoverEffect ? { scale: 1.01 } : {}}
      whileTap={isClickable ? { scale: 0.99 } : {}}
      {...containerProps}
    >
      {children}
    </motion.div>
  );
};

export default Card;
