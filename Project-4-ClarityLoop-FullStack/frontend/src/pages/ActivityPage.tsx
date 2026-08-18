import { useMemo } from 'react';
import { Activity as ActivityIcon, Plus, Pencil, CheckCircle2, Clock } from 'lucide-react';
import type { Decision } from '@/types';
import { RowSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { ReviewBadge } from '@/components/ReviewBadge';
import { relativeTime, formatDateTime } from '@/utils/format';

interface ActivityPageProps {
  decisions: Decision[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function ActivityPage({ decisions, loading, error, onRetry }: ActivityPageProps) {
  const events = useMemo(() => {
    const out: { decision: Decision; type: 'created' | 'updated'; when: string }[] = [];
    decisions.forEach((d) => {
      if (d.createdAt) out.push({ decision: d, type: 'created', when: d.createdAt });
      if (d.updatedAt && d.updatedAt !== d.createdAt)
        out.push({ decision: d, type: 'updated', when: d.updatedAt });
    });
    return out.sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime());
  }, [decisions]);

  if (loading) {
    return (
      <div className="card p-4 space-y-1">
        {Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <ErrorState title="Couldn't load activity" message={error} onRetry={onRetry} />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="card">
        <EmptyState
          icon={<ActivityIcon size={28} />}
          title="No activity yet"
          description="Recent changes to your decisions will appear here in chronological order."
        />
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <ActivityIcon size={15} className="text-dim" />
        <h2 className="font-semibold">Activity Timeline</h2>
      </div>
      <ol className="relative space-y-1 pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-[var(--border)]">
        {events.map((e, i) => {
          const Icon = e.type === 'created' ? Plus : Pencil;
          const color = e.type === 'created' ? '#10B981' : '#3B82F6';
          return (
            <li key={`${e.decision.id}-${e.type}-${i}`} className="relative">
              <span
                className="absolute -left-6 top-3 flex items-center justify-center rounded-full"
                style={{ width: 22, height: 22, background: `${color}1a`, border: `1px solid ${color}33`, color }}
              >
                <Icon size={11} />
              </span>
              <div className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[var(--surface-2)] transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{e.decision.title}</span>
                    <span className="text-dim"> · {e.type === 'created' ? 'created' : 'updated'}</span>
                  </p>
                  <p className="text-xs text-dim mt-0.5" title={formatDateTime(e.when)}>
                    {relativeTime(e.when)} · {formatDateTime(e.when)}
                  </p>
                </div>
                <ReviewBadge status={e.decision.reviewStatus} />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
