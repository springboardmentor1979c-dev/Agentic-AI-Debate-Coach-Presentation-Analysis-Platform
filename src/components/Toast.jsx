import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCheckmarkCircle, IoCloseCircle, IoAlertCircle, IoInformationCircle, IoClose } from 'react-icons/io5';

const Toast = ({
  message,
  type = 'success', // 'success', 'error', 'warning', 'info'
  isVisible,
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const icons = {
    success: <IoCheckmarkCircle className="h-5 w-5 text-emerald-500" />,
    error: <IoCloseCircle className="h-5 w-5 text-rose-500" />,
    warning: <IoAlertCircle className="h-5 w-5 text-amber-500" />,
    info: <IoInformationCircle className="h-5 w-5 text-blue-500" />,
  };

  const borderColors = {
    success: "border-emerald-500/30",
    error: "border-rose-500/30",
    warning: "border-amber-500/30",
    info: "border-blue-500/30",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl glass-panel shadow-2xl border ${borderColors[type]} max-w-sm`}
        >
          <div className="flex-shrink-0">{icons[type]}</div>
          <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{message}</div>
          <button
            onClick={onClose}
            className="ml-auto p-0.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <IoClose className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
