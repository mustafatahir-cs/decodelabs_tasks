import { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Modal } from '@/components/Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);

  async function handle() {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onCancel}
      size="sm"
      labelledBy="confirm-title"
      footer={
        <>
          <button onClick={onCancel} className="btn btn-ghost" disabled={busy}>
            {cancelLabel}
          </button>
          <button onClick={handle} className="btn btn-danger" disabled={busy}>
            {busy ? (
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            <span className="truncate">{busy ? 'Deleting…' : confirmLabel}</span>
          </button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div
          className="shrink-0 rounded-xl p-3"
          style={{
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.25)',
            color: '#F87171',
          }}
        >
          <AlertTriangle size={20} />
        </div>
        <div className="min-w-0">
          <h2 id="confirm-title" className="text-base font-semibold">
            {title}
          </h2>
          <p className="text-sm text-muted mt-1.5 leading-relaxed">{message}</p>
        </div>
      </div>
    </Modal>
  );
}
