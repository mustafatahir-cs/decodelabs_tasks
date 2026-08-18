import { Eye, Pencil, Trash2, Calendar } from 'lucide-react';
import type { Decision } from '@/types';
import { ConfidenceIndicator, ConfidenceBar } from '@/components/ConfidenceIndicator';
import { Tag } from '@/components/Tag';
import { ReviewBadge } from '@/components/ReviewBadge';
import { relativeTime, truncate } from '@/utils/format';

interface DecisionCardProps {
  decision: Decision;
  onView: (d: Decision) => void;
  onEdit: (d: Decision) => void;
  onDelete: (d: Decision) => void;
}

export function DecisionCard({ decision, onView, onEdit, onDelete }: DecisionCardProps) {
  const tags = (decision.tags || []).slice(0, 3);
  const extraTags = (decision.tags || []).length - 3;

  return (
    <article
      className="card p-5 flex flex-col gap-3.5 transition-all duration-300 hover:border-[var(--border-strong)] group"
    >
      <div className="flex items-start justify-between gap-3">
        <button
          onClick={() => onView(decision)}
          className="text-left min-w-0 flex-1 group/title"
        >
          <h3 className="font-semibold leading-snug group-hover/title:text-[var(--accent)] transition-colors line-clamp-2 tracking-tight">
            {decision.title}
          </h3>
        </button>
        <ConfidenceIndicator value={decision.confidence} size="sm" showLabel={false} />
      </div>

      {decision.context && (
        <p className="text-sm text-muted leading-relaxed line-clamp-2">
          {truncate(decision.context, 140)}
        </p>
      )}

      <ConfidenceBar value={decision.confidence} />

      {decision.selectedOption && (
        <div className="flex items-start gap-2 text-sm">
          <span className="text-dim shrink-0">Chosen:</span>
          <span className="font-medium text-[var(--accent-cyan)] truncate">
            {decision.selectedOption}
          </span>
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t, i) => (
            <Tag key={`${t}-${i}`} label={t} />
          ))}
          {extraTags > 0 && (
            <span className="chip">+{extraTags}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 mt-auto border-t border-[var(--border)]">
        <div className="flex items-center gap-3 min-w-0">
          <ReviewBadge status={decision.reviewStatus} />
          {decision.createdAt && (
            <span className="text-xs text-dim flex items-center gap-1 truncate">
              <Calendar size={11} />
              {relativeTime(decision.createdAt)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onView(decision)}
            aria-label={`View ${decision.title}`}
            className="p-1.5 rounded-lg text-dim hover:text-[var(--accent)] hover:bg-[var(--surface-2)] transition-colors"
          >
            <Eye size={15} />
          </button>
          <button
            onClick={() => onEdit(decision)}
            aria-label={`Edit ${decision.title}`}
            className="p-1.5 rounded-lg text-dim hover:text-[var(--accent-cyan)] hover:bg-[var(--surface-2)] transition-colors"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(decision)}
            aria-label={`Delete ${decision.title}`}
            className="p-1.5 rounded-lg text-dim hover:text-[var(--danger)] hover:bg-[var(--surface-2)] transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
