import { useState } from 'react';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import type { Decision, DecisionInput } from '@/types';
import { DecisionForm } from '@/components/DecisionForm';
import { useToast } from '@/components/Toast';
import { createDecision } from '@/services/api';
import type { Page } from '@/App';

interface NewDecisionPageProps {
  onCreated: () => void;
  onNavigate: (p: Page) => void;
  onAfterChange: () => void;
}

export function NewDecisionPage({ onCreated, onNavigate, onAfterChange }: NewDecisionPageProps) {
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  async function handleSubmit(input: DecisionInput) {
    setSubmitting(true);
    try {
      await createDecision(input);
      toast.success('Decision created', `"${input.title}" was saved successfully.`);
      onAfterChange();
      onCreated();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      toast.error('Could not create decision', msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('decisions')}
          aria-label="Back to decisions"
          className="rounded-lg p-2 text-dim hover:text-muted hover:bg-[var(--surface-2)] transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <PlusCircle size={18} className="text-[var(--accent)]" />
            New Decision
          </h2>
          <p className="text-sm text-dim">Document a decision and the reasoning behind it.</p>
        </div>
      </div>

      <div className="card p-5 sm:p-6">
        <DecisionForm
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => onNavigate('decisions')}
        />
      </div>
    </div>
  );
}
