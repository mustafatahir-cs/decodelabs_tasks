import { confidenceLabel, confidenceTone } from '@/utils/format';

interface ConfidenceIndicatorProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

// Radial progress ring. Sized by `size`. The ring uses a calm color ramp
// (green / cyan / amber / red) rather than bright traffic-light colors.
export function ConfidenceIndicator({
  value,
  size = 'md',
  showLabel = true,
}: ConfidenceIndicatorProps) {
  const v = Math.max(0, Math.min(100, value || 0));
  const tone = confidenceTone(v);
  const dims = {
    sm: { box: 36, stroke: 3, font: 10 },
    md: { box: 52, stroke: 4, font: 13 },
    lg: { box: 76, stroke: 5, font: 18 },
  }[size];
  const r = (dims.box - dims.stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (v / 100) * circ;

  return (
    <div className="inline-flex items-center gap-3">
      <div
        className="relative shrink-0"
        style={{ width: dims.box, height: dims.box }}
        role="img"
        aria-label={`Confidence ${v} percent, ${confidenceLabel(v)}`}
      >
        <svg width={dims.box} height={dims.box} className="-rotate-90">
          <circle
            cx={dims.box / 2}
            cy={dims.box / 2}
            r={r}
            fill="none"
            stroke="var(--border)"
            strokeWidth={dims.stroke}
          />
          <circle
            cx={dims.box / 2}
            cy={dims.box / 2}
            r={r}
            fill="none"
            stroke={tone.color}
            strokeWidth={dims.stroke}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s' }}
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center font-semibold tabular-nums"
          style={{ fontSize: dims.font, color: tone.text }}
        >
          {Math.round(v)}
        </div>
      </div>
      {showLabel && (
        <div className="leading-tight">
          <div className="text-sm font-semibold" style={{ color: tone.text }}>
            {confidenceLabel(v)}
          </div>
          <div className="text-xs text-dim">{v}% confidence</div>
        </div>
      )}
    </div>
  );
}

// Compact horizontal bar variant for cards / lists.
export function ConfidenceBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value || 0));
  const tone = confidenceTone(v);
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium" style={{ color: tone.text }}>
          {confidenceLabel(v)}
        </span>
        <span className="text-xs text-dim tabular-nums">{v}%</span>
      </div>
      <div
        className="h-1.5 w-full rounded-full overflow-hidden"
        style={{ background: 'var(--surface-3)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${v}%`, background: tone.color }}
        />
      </div>
    </div>
  );
}
