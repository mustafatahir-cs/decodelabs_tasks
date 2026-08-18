import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  labelledBy?: string;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  labelledBy,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`card relative w-full ${widths[size]} animate-scaleIn max-h-[92vh] sm:max-h-[90vh] flex flex-col rounded-b-none sm:rounded-b-[14px] overflow-hidden`}>
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 p-5 border-b border-[var(--border)] shrink-0">
            <div className="min-w-0">
              {title && (
                <h2
                  id={labelledBy}
                  className="text-base font-semibold leading-snug break-words"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-muted mt-1 leading-snug break-words">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="shrink-0 rounded-lg p-1.5 text-dim hover:text-muted hover:bg-[var(--surface-2)] transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="p-5 overflow-y-auto flex-1 min-h-0">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 p-4 border-t border-[var(--border)] bg-[var(--surface-2)]/40 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
