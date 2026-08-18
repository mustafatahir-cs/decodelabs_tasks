import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
}

export function EmptyState({ icon, title, description, action, compact }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${compact ? 'py-10' : 'py-16'} px-6`}
    >
      <div
        className="flex items-center justify-center rounded-2xl mb-5"
        style={{
          width: compact ? 48 : 56,
          height: compact ? 48 : 56,
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          color: 'var(--text-dim)',
        }}
      >
        {icon}
      </div>
      <h3 className={`font-semibold tracking-tight ${compact ? 'text-sm' : 'text-base'}`}>{title}</h3>
      {description && (
        <p className="text-sm text-muted mt-1.5 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
