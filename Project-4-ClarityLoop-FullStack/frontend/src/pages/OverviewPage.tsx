import { useMemo } from 'react';
import { ListChecks, Gauge, CheckCircle2, Clock, ArrowRight, Activity as ActivityIcon } from 'lucide-react';
import type { Decision } from '@/types';
import { StatCard } from '@/components/StatCard';
import { ConfidenceIndicator } from '@/components/ConfidenceIndicator';
import { ReviewBadge } from '@/components/ReviewBadge';
import { DecisionCardSkeleton, StatCardSkeleton, ChartSkeleton, RowSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { ConfidenceDistribution, CategoryBars, ReviewDonut } from '@/components/Charts';
import { relativeTime, truncate } from '@/utils/format';
import type { Page } from '@/App';

interface OverviewPageProps {
  decisions: Decision[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onNavigate: (p: Page) => void;
  onView: (d: Decision) => void;
}

export function OverviewPage({ decisions, loading, error, onRetry, onNavigate, onView }: OverviewPageProps) {
  const stats = useMemo(() => {
    const total = decisions.length;
    const avg = total ? Math.round(decisions.reduce((s, d) => s + (d.confidence || 0), 0) / total) : 0;
    const reviewed = decisions.filter(
      (d) => d.reviewStatus === 'reviewed' || d.reviewStatus === 'approved'
    ).length;
    const pending = total - reviewed;
    return { total, avg, reviewed, pending };
  }, [decisions]);

  const recent = useMemo(
    () =>
      [...decisions]
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 4),
    [decisions]
  );

  const activity = useMemo(
    () =>
      [...decisions]
        .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())
        .slice(0, 5),
    [decisions]
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <ChartSkeleton />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => <DecisionCardSkeleton key={i} />)}
            </div>
          </div>
          <div className="space-y-4">
            <ChartSkeleton />
            <div className="card p-4 space-y-1">
              {Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <ErrorState
          title="Unable to load your dashboard"
          message={error}
          detail="This usually means the ClarityLoop backend is not running or is unreachable."
          onRetry={onRetry}
        />
      </div>
    );
  }

  if (decisions.length === 0) {
    return (
      <div className="card">
        <EmptyState
          icon={<ListChecks size={28} />}
          title="No decisions yet"
          description="Start documenting important decisions so you can review the reasoning behind them later."
          action={
            <button onClick={() => onNavigate('new')} className="btn btn-primary">
              Create First Decision
              <ArrowRight size={14} />
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Decisions" value={stats.total} icon={<ListChecks size={18} />} hint="All recorded decisions" accent="#3B82F6" />
        <StatCard label="Average Confidence" value={`${stats.avg}%`} icon={<Gauge size={18} />} hint="Across all decisions" accent="#06B6D4" />
        <StatCard label="Reviewed Decisions" value={stats.reviewed} icon={<CheckCircle2 size={18} />} hint="Reviewed or approved" accent="#10B981" />
        <StatCard label="Pending Reviews" value={stats.pending} icon={<Clock size={18} />} hint="Awaiting review" accent="#F59E0B" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent decisions */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold tracking-tight">Recent Decisions</h2>
            <button onClick={() => onNavigate('decisions')} className="text-xs font-medium text-[var(--accent)] hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {recent.map((d) => (
              <button
                key={d.id}
                onClick={() => onView(d)}
                className="w-full flex items-center gap-3 sm:gap-4 p-3 rounded-xl text-left transition-all duration-200 hover:bg-[var(--surface-2)] group"
              >
                <ConfidenceIndicator value={d.confidence} size="sm" showLabel={false} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate group-hover:text-[var(--accent)] transition-colors">{d.title}</p>
                  <p className="text-xs text-dim truncate">{truncate(d.context, 80) || 'No context'}</p>
                </div>
                <span className="hidden sm:block shrink-0"><ReviewBadge status={d.reviewStatus} /></span>
                <span className="text-xs text-dim hidden md:inline shrink-0">{relativeTime(d.createdAt)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Confidence distribution */}
        <div className="card p-5">
          <h2 className="font-semibold tracking-tight mb-5">Confidence Distribution</h2>
          <ConfidenceDistribution decisions={decisions} />
        </div>

        {/* Review donut */}
        <div className="card p-5">
          <h2 className="font-semibold tracking-tight mb-5">Review Status</h2>
          <ReviewDonut decisions={decisions} />
        </div>

        {/* Categories */}
        <div className="card p-5">
          <h2 className="font-semibold tracking-tight mb-5">Decision Categories</h2>
          <CategoryBars decisions={decisions} />
        </div>

        {/* Activity */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <ActivityIcon size={15} className="text-dim" />
            <h2 className="font-semibold tracking-tight">Recent Activity</h2>
          </div>
          <div className="space-y-1">
            {activity.map((d) => (
              <div key={d.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[var(--surface-2)] transition-colors">
                <span className="mt-1.5 h-2 w-2 rounded-full shrink-0" style={{ background: 'var(--accent)' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{d.title}</p>
                  <p className="text-xs text-dim">{relativeTime(d.updatedAt || d.createdAt)}</p>
                </div>
                <ReviewBadge status={d.reviewStatus} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
