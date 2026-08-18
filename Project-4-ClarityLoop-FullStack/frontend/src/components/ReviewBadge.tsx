import { reviewStatusMeta } from '@/utils/format';

export function ReviewBadge({ status }: { status?: string }) {
  const meta = reviewStatusMeta(status);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ color: meta.color, background: meta.bg, border: `1px solid ${meta.border}` }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: meta.color }}
      />
      {meta.label}
    </span>
  );
}
