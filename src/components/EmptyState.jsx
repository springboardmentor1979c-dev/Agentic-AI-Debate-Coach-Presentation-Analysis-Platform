import React from 'react';
import { IoFolderOpen } from 'react-icons/io5';
import Button from './Button';

const EmptyState = ({
  title = "No data found",
  description = "There are no entries available in this tab right now.",
  actionText,
  onAction,
  icon: Icon = IoFolderOpen,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 glass-panel dark:bg-darkbg-card/45 rounded-3xl border border-dashed border-slate-300 dark:border-darkbg-border my-6">
      <div className="p-4 bg-indigo-50 dark:bg-darkbg-accent text-indigo-500 dark:text-brand-400 rounded-2xl mb-4">
        <Icon className="h-10 w-10" />
      </div>
      <h3 className="text-lg font-bold font-display text-slate-800 dark:text-slate-200 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="secondary" size="sm">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
