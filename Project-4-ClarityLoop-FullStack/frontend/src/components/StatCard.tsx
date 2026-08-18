import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  hint?: string;
  trend?: { value: string; up: boolean };
  accent?: string;
}

export function StatCard({ label, value, icon, hint, trend, accent = '#3B82F6' }: StatCardProps) {
  return (
    <div className="card p-5 group transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--border-strong)]">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-semibold mt-2 tabular-nums">{value}</p>
          {hint && <p className="text-xs text-dim mt-1.5">{hint}</p>}
        </div>
        <div
          className="shrink-0 rounded-xl p-2.5 transition-transform duration-300 group-hover:scale-105"
          style={{
            background: `${accent}1a`,
            color: accent,
            border: `1px solid ${accent}33`,
          }}
        >
          {icon}
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-[var(--border)]">
          <span
            className="inline-flex items-center gap-0.5 text-xs font-medium"
            style={{ color: trend.up ? '#34D399' : '#F87171' }}
          >
            {trend.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trend.value}
          </span>
          <span className="text-xs text-dim">vs last week</span>
        </div>
      )}
    </div>
  );
}
