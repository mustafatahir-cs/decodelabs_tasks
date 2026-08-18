import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  detail?: string;
  onRetry?: () => void;
  retryLabel?: string;
  compact?: boolean;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  detail,
  onRetry,
  retryLabel = 'Retry',
  compact,
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8' : 'py-14'} px-6`}
      role="alert"
    >
      <div
        className="flex items-center justify-center rounded-2xl mb-5"
        style={{
          width: compact ? 44 : 52,
          height: compact ? 44 : 52,
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          color: '#F87171',
        }}
      >
        <AlertTriangle size={compact ? 20 : 22} />
      </div>
      <h3 className={`font-semibold tracking-tight ${compact ? 'text-sm' : 'text-base'}`}>{title}</h3>
      <p className="text-sm text-muted mt-1.5 max-w-sm leading-relaxed">{message}</p>
      {detail && (
        <p className="text-xs text-dim mt-2 max-w-md leading-relaxed font-mono">
          {detail}
        </p>
      )}
      {onRetry && (
        <button onClick={onRetry} className="btn btn-ghost mt-5" disabled={!onRetry}>
          <RefreshCw size={14} />
          {retryLabel}
        </button>
      )}
    </div>
  );
}
