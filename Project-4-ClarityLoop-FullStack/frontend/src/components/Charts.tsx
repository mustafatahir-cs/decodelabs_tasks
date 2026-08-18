import { useMemo } from 'react';
import type { Decision } from '@/types';
import { confidenceTone } from '@/utils/format';

// Lightweight, dependency-free charts built from SVG + flexbox.
// They render server data only — no fabricated numbers.

export function ConfidenceDistribution({ decisions }: { decisions: Decision[] }) {
  const buckets = useMemo(() => {
    const b = [
      { label: '0–20', min: 0, max: 20, count: 0 },
      { label: '21–40', min: 21, max: 40, count: 0 },
      { label: '41–60', min: 41, max: 60, count: 0 },
      { label: '61–80', min: 61, max: 80, count: 0 },
      { label: '81–100', min: 81, max: 100, count: 0 },
    ];
    decisions.forEach((d) => {
      const v = Math.max(0, Math.min(100, d.confidence || 0));
      const hit = b.find((x) => v >= x.min && v <= x.max);
      if (hit) hit.count++;
    });
    return b;
  }, [decisions]);

  const max = Math.max(1, ...buckets.map((b) => b.count));

  return (
    <div className="flex items-end justify-between gap-3 h-40">
      {buckets.map((b) => {
        const pct = (b.count / max) * 100;
        const mid = (b.min + b.max) / 2;
        const tone = confidenceTone(mid);
        return (
          <div key={b.label} className="flex-1 flex flex-col items-center gap-2 group">
            <div className="w-full flex-1 flex items-end justify-center relative">
              <div
                className="w-full max-w-[44px] rounded-t-md transition-all duration-500 hover:opacity-80"
                style={{
                  height: `${Math.max(4, pct)}%`,
                  background: `linear-gradient(180deg, ${tone.color}, ${tone.color}66)`,
                }}
                title={`${b.count} decision${b.count === 1 ? '' : 's'}`}
              />
              <span className="absolute -top-5 text-[10px] font-semibold tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">
                {b.count}
              </span>
            </div>
            <span className="text-[10px] text-dim tabular-nums">{b.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function CategoryBars({ decisions }: { decisions: Decision[] }) {
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    decisions.forEach((d) => {
      (d.tags || []).forEach((t) => map.set(t, (map.get(t) || 0) + 1));
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [decisions]);

  const max = Math.max(1, ...counts.map((c) => c[1]));

  if (counts.length === 0) {
    return (
      <p className="text-sm text-dim italic text-center py-8">
        No tags yet. Add tags to your decisions to see categories here.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {counts.map(([tag, count], i) => (
        <div key={tag} className="flex items-center gap-3">
          <span className="text-xs font-medium w-24 truncate shrink-0">{tag}</span>
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(count / max) * 100}%`,
                background: i === 0 ? '#3B82F6' : i === 1 ? '#06B6D4' : i === 2 ? '#8B5CF6' : '#64748B',
              }}
            />
          </div>
          <span className="text-xs text-dim tabular-nums w-6 text-right shrink-0">{count}</span>
        </div>
      ))}
    </div>
  );
}

export function ReviewDonut({ decisions }: { decisions: Decision[] }) {
  const counts = useMemo(() => {
    let reviewed = 0, pending = 0, inReview = 0;
    decisions.forEach((d) => {
      const s = d.reviewStatus;
      if (s === 'reviewed' || s === 'approved') reviewed++;
      else if (s === 'in_review') inReview++;
      else pending++;
    });
    return { reviewed, pending, inReview, total: decisions.length };
  }, [decisions]);

  if (counts.total === 0) {
    return (
      <p className="text-sm text-dim italic text-center py-8">
        No decisions to summarize yet.
      </p>
    );
  }

  const segments = [
    { label: 'Reviewed', value: counts.reviewed, color: '#10B981' },
    { label: 'In Review', value: counts.inReview, color: '#06B6D4' },
    { label: 'Pending', value: counts.pending, color: '#F59E0B' },
  ];
  const total = counts.total;
  const r = 54;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex items-center gap-6 flex-wrap justify-center">
      <div className="relative" style={{ width: 140, height: 140 }}>
        <svg width="140" height="140" className="-rotate-90">
          <circle cx="70" cy="70" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="14" />
          {segments.map((s) => {
            if (s.value === 0) return null;
            const len = (s.value / total) * circ;
            const el = (
              <circle
                key={s.label}
                cx="70"
                cy="70"
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth="14"
                strokeDasharray={`${len} ${circ - len}`}
                strokeDashoffset={-offset}
                style={{ transition: 'stroke-dasharray 0.6s ease' }}
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tabular-nums">{total}</span>
          <span className="text-[11px] text-dim uppercase tracking-wider">Total</span>
        </div>
      </div>
      <div className="space-y-2">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            <span className="text-muted">{s.label}</span>
            <span className="font-medium tabular-nums ml-auto pl-4">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
