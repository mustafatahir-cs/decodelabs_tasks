import { useEffect } from 'react';
import { X, Calendar, Clock, FileText, ListChecks, Tag as TagIcon, Pencil, Trash2 } from 'lucide-react';
import type { Decision } from '@/types';
import { ConfidenceIndicator } from '@/components/ConfidenceIndicator';
import { Tag } from '@/components/Tag';
import { ReviewBadge } from '@/components/ReviewBadge';
import { formatDate, formatDateTime } from '@/utils/format';

interface DecisionDrawerProps {
  decision: Decision | null;
  onClose: () => void;
  onEdit: (d: Decision) => void;
  onDelete: (d: Decision) => void;
}

export function DecisionDrawer({ decision, onClose, onEdit, onDelete }: DecisionDrawerProps) {
  useEffect(() => {
    if (!decision) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [decision, onClose]);

  if (!decision) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose} aria-hidden="true" />
      <aside className="relative w-full max-w-md h-full surface border-l border-[var(--border)] shadow-2xl animate-fadeIn flex flex-col max-w-[min(100vw,28rem)]">
        <header className="flex items-start justify-between gap-3 p-5 border-b border-[var(--border)]">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-dim uppercase tracking-wider">Decision Record</p>
            <h2 id="drawer-title" className="text-lg font-semibold mt-1 leading-snug break-words">
              {decision.title}
            </h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="shrink-0 rounded-lg p-1.5 text-dim hover:text-muted hover:bg-[var(--surface-2)] transition-colors">
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div className="flex items-center justify-between gap-4 surface-2 rounded-xl p-4 flex-wrap">
            <ConfidenceIndicator value={decision.confidence} size="md" />
            <ReviewBadge status={decision.reviewStatus} />
          </div>

          <Section icon={<FileText size={14} />} label="Context">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {decision.context || <span className="text-dim italic">No context provided.</span>}
            </p>
          </Section>

          <Section icon={<ListChecks size={14} />} label="Reasoning">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {decision.reasoning || <span className="text-dim italic">No reasoning provided.</span>}
            </p>
          </Section>

          <Section icon={<ListChecks size={14} />} label="Options Considered">
            <ul className="space-y-2">
              {(decision.options || []).map((o, i) => {
                const selected = o.label === decision.selectedOption;
                return (
                  <li
                    key={o.id || i}
                    className="flex items-center gap-2.5 text-sm"
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: 10,
                      border: selected ? '1px solid rgba(6,182,212,0.4)' : '1px solid var(--border)',
                      background: selected ? 'rgba(6,182,212,0.08)' : 'var(--surface-2)',
                    }}
                  >
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ background: selected ? 'var(--accent-cyan)' : 'var(--text-dim)' }}
                    />
                    <span className={selected ? 'font-medium text-[var(--accent-cyan)]' : 'text-muted'}>
                      {o.label || <span className="italic text-dim">Empty option</span>}
                    </span>
                    {selected && (
                      <span className="ml-auto text-xs text-[var(--accent-cyan)] font-medium">Selected</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </Section>

          {(decision.tags || []).length > 0 && (
            <Section icon={<TagIcon size={14} />} label="Tags">
              <div className="flex flex-wrap gap-1.5">
                {decision.tags.map((t, i) => (
                  <Tag key={`${t}-${i}`} label={t} />
                ))}
              </div>
            </Section>
          )}

          <Section icon={<Calendar size={14} />} label="Dates">
            <dl className="space-y-2.5 text-sm">
              <DateRow label="Created" value={formatDateTime(decision.createdAt)} />
              <DateRow label="Updated" value={formatDateTime(decision.updatedAt)} />
              <DateRow label="Review due" value={formatDate(decision.reviewDate)} />
            </dl>
          </Section>
        </div>

        <footer className="flex items-center gap-2 p-4 border-t border-[var(--border)] bg-[var(--surface-2)]/40">
          <button onClick={() => onEdit(decision)} className="btn btn-ghost flex-1 min-w-0">
            <Pencil size={14} className="shrink-0" />
            <span className="truncate">Edit</span>
          </button>
          <button onClick={() => onDelete(decision)} className="btn btn-danger flex-1 min-w-0">
            <Trash2 size={14} className="shrink-0" />
            <span className="truncate">Delete</span>
          </button>
        </footer>
      </aside>
    </div>
  );
}

function Section({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-2.5">
        {icon}
        {label}
      </h3>
      {children}
    </section>
  );
}

function DateRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-dim flex items-center gap-1.5">
        <Clock size={12} />
        {label}
      </dt>
      <dd className="font-medium tabular-nums text-right">
        {value || <span className="text-dim italic font-normal">Not set</span>}
      </dd>
    </div>
  );
}
