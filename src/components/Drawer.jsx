import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';

const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right', // 'left', 'right'
  size = 'md', // 'sm', 'md', 'lg'
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizes = {
    sm: "max-w-xs",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  const slideVariants = {
    hidden: { x: position === 'right' ? '100%' : '-100%' },
    visible: { x: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Inner Wrapper */}
          <div className={`absolute inset-y-0 ${position === 'right' ? 'right-0' : 'left-0'} flex max-w-full`}>
            <motion.div
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ type: "tween", duration: 0.3 }}
              className={`w-screen ${sizes[size]} glass-panel-deep dark:bg-darkbg-card border-l border-slate-200/50 dark:border-white/10 shadow-xl flex flex-col`}
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 dark:border-darkbg-border flex items-center justify-between">
                <h2 className="text-lg font-bold font-display text-slate-900 dark:text-slate-100">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-darkbg-accent transition-colors"
                >
                  <IoClose className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-6 text-slate-600 dark:text-slate-300">
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Drawer;
