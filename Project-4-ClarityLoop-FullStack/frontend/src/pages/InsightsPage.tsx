import { useMemo } from 'react';
import { BarChart3, TrendingUp, Gauge, ListChecks, Tag as TagIcon } from 'lucide-react';
import type { Decision } from '@/types';
import { ConfidenceDistribution, CategoryBars, ReviewDonut } from '@/components/Charts';
import { DecisionCardSkeleton, ChartSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { confidenceLabel } from '@/utils/format';

interface InsightsPageProps {
  decisions: Decision[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function InsightsPage({ decisions, loading, error, onRetry }: InsightsPageProps) {
  const insights = useMemo(() => {
    const total = decisions.length;
    const avg = total ? Math.round(decisions.reduce((s, d) => s + (d.confidence || 0), 0) / total) : 0;
    const high = decisions.filter((d) => (d.confidence || 0) >= 70).length;
    const low = decisions.filter((d) => (d.confidence || 0) < 30).length;
    const reviewed = decisions.filter((d) => d.reviewStatus === 'reviewed' || d.reviewStatus === 'approved').length;
    const tagMap = new Map<string, number>();
    decisions.forEach((d) => (d.tags || []).forEach((t) => tagMap.set(t, (tagMap.get(t) || 0) + 1)));
    const topTag = Array.from(tagMap.entries()).sort((a, b) => b[1] - a[1])[0];
    return { total, avg, high, low, reviewed, topTag };
  }, [decisions]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <ChartSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <ErrorState title="Couldn't load insights" message={error} onRetry={onRetry} />
      </div>
    );
  }

  if (decisions.length === 0) {
    return (
      <div className="card">
        <EmptyState
          icon={<BarChart3 size={28} />}
          title="No insights yet"
          description="Once you've recorded a few decisions, patterns and trends will appear here."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <InsightTile icon={<Gauge size={18} />} label="Average Confidence" value={`${insights.avg}%`} sub={confidenceLabel(insights.avg)} accent="#06B6D4" />
        <InsightTile icon={<TrendingUp size={18} />} label="High-Confidence" value={String(insights.high)} sub="Decisions at 70% or above" accent="#10B981" />
        <InsightTile icon={<ListChecks size={18} />} label="Review Rate" value={`${insights.total ? Math.round((insights.reviewed / insights.total) * 100) : 0}%`} sub={`${insights.reviewed} of ${insights.total} reviewed`} accent="#3B82F6" />
        <InsightTile icon={<TagIcon size={18} />} label="Top Category" value={insights.topTag ? insights.topTag[0] : '—'} sub={insights.topTag ? `${insights.topTag[1]} decisions` : 'No tags yet'} accent="#8B5CF6" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="font-semibold mb-4">Confidence Distribution</h2>
          <ConfidenceDistribution decisions={decisions} />
        </div>
        <div className="card p-5">
          <h2 className="font-semibold mb-4">Review Status</h2>
          <ReviewDonut decisions={decisions} />
        </div>
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold mb-4">Decision Categories</h2>
          <CategoryBars decisions={decisions} />
        </div>
      </div>
    </div>
  );
}

function InsightTile({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: string; sub: string; accent: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted uppercase tracking-wider">{label}</p>
        <span className="rounded-lg p-1.5" style={{ background: `${accent}1a`, color: accent }}>{icon}</span>
      </div>
      <p className="text-2xl font-semibold mt-3 truncate">{value}</p>
      <p className="text-xs text-dim mt-1">{sub}</p>
    </div>
  );
}
