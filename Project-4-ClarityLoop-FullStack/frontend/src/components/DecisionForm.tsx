import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, AlertCircle, Save, X, Check } from 'lucide-react';
import type { Decision, DecisionInput, DecisionOption, ReviewStatus } from '@/types';
import { uniqueId } from '@/utils/format';

interface DecisionFormProps {
  initial?: Decision | null;
  submitting: boolean;
  onSubmit: (input: DecisionInput) => Promise<void>;
  onCancel: () => void;
}

interface FormState {
  title: string;
  context: string;
  reasoning: string;
  confidence: number;
  options: DecisionOption[];
  selectedOption: string;
  tags: string[];
  reviewDate: string;
  reviewStatus: ReviewStatus;
}

const EMPTY: FormState = {
  title: '',
  context: '',
  reasoning: '',
  confidence: 75,
  options: [
    { id: uniqueId('opt'), label: '' },
    { id: uniqueId('opt'), label: '' },
  ],
  selectedOption: '',
  tags: [],
  reviewDate: '',
  reviewStatus: 'pending',
};

function fromDecision(d: Decision): FormState {
  const options =
    d.options && d.options.length >= 2
      ? d.options.map((o) => ({ id: o.id || uniqueId('opt'), label: o.label }))
      : [
          { id: uniqueId('opt'), label: d.selectedOption || '' },
          { id: uniqueId('opt'), label: '' },
        ];
  return {
    title: d.title || '',
    context: d.context || '',
    reasoning: d.reasoning || '',
    confidence: d.confidence ?? 75,
    options,
    selectedOption: d.selectedOption || '',
    tags: d.tags || [],
    reviewDate: d.reviewDate ? d.reviewDate.slice(0, 10) : '',
    reviewStatus: (d.reviewStatus as ReviewStatus) || 'pending',
  };
}

export function DecisionForm({ initial, submitting, onSubmit, onCancel }: DecisionFormProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [tagInput, setTagInput] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setForm(initial ? fromDecision(initial) : EMPTY);
    setTouched({});
    setTagInput('');
  }, [initial]);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required.';
    else if (form.title.trim().length < 3) e.title = 'Title must be at least 3 characters.';
    else if (form.title.trim().length > 120) e.title = 'Title must be 120 characters or fewer.';
    if (!form.context.trim()) e.context = 'Context is required.';
    else if (form.context.trim().length > 500) e.context = 'Context must be 500 characters or fewer.';
    if (!form.reasoning.trim()) e.reasoning = 'Reasoning is required.';
    else if (form.reasoning.trim().length > 1000) e.reasoning = 'Reasoning must be 1000 characters or fewer.';
    if (form.confidence < 1 || form.confidence > 100)
      e.confidence = 'Confidence must be between 1 and 100.';
    const validOptions = form.options.filter((o) => o.label.trim());
    const uniqueOptions = new Set(validOptions.map((o) => o.label.trim()));
    if (validOptions.length < 2)
      e.options = 'At least two options are required.';
    else if (uniqueOptions.size !== validOptions.length)
      e.options = 'Decision options must be unique.';
    else if (validOptions.some((o) => o.label.trim().length > 250))
      e.options = 'Each option must be 250 characters or fewer.';
    if (!form.selectedOption)
      e.selectedOption = 'Please select the option you chose.';
    else if (!validOptions.some((o) => o.label === form.selectedOption))
      e.selectedOption = 'Selected option must match one of the entered options.';
    return e;
  }, [form]);

  const valid = Object.keys(errors).length === 0;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setOption(id: string, label: string) {
    setForm((f) => ({
      ...f,
      options: f.options.map((o) => (o.id === id ? { ...o, label } : o)),
    }));
  }

  function addOption() {
    setForm((f) => ({
      ...f,
      options: [...f.options, { id: uniqueId('opt'), label: '' }],
    }));
  }

  function removeOption(id: string) {
    setForm((f) => {
      const next = f.options.filter((o) => o.id !== id);
      if (next.length < 2) return f;
      const selectedStillValid = next.some((o) => o.label === f.selectedOption);
      return {
        ...f,
        options: next,
        selectedOption: selectedStillValid ? f.selectedOption : '',
      };
    });
  }

  function addTag() {
    const t = tagInput.trim();
    if (!t) return;
    if (form.tags.includes(t)) {
      setTagInput('');
      return;
    }
    update('tags', [...form.tags, t]);
    setTagInput('');
  }

  function removeTag(tag: string) {
    update(
      'tags',
      form.tags.filter((t) => t !== tag)
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({
      title: true,
      context: true,
      reasoning: true,
      confidence: true,
      options: true,
      selectedOption: true,
    });
    if (!valid) return;
    const cleanOptions = form.options
      .filter((o) => o.label.trim())
      .map((o) => ({ id: o.id, label: o.label.trim() }));
    await onSubmit({
      title: form.title.trim(),
      context: form.context.trim(),
      reasoning: form.reasoning.trim(),
      confidence: Number(form.confidence),
      options: cleanOptions,
      selectedOption: form.selectedOption || cleanOptions[0]?.label || '',
      tags: form.tags,
      reviewDate: form.reviewDate || null,
      reviewStatus: form.reviewStatus,
    });
  }

  const field = (name: string, label: string, children: React.ReactNode, help?: string, err?: string) => (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      {children}
      {err && touched[name] ? (
        <p className="hint flex items-center gap-1" style={{ color: 'var(--danger)' }}>
          <AlertCircle size={11} />
          {err}
        </p>
      ) : help ? (
        <p className="hint">{help}</p>
      ) : null}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {field(
        'title',
        'Title',
        <input
          id="title"
          className="input"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, title: true }))}
          placeholder="e.g. Migrate from monolith to microservices"
          maxLength={120}
          aria-invalid={touched.title && !!errors.title}
        />,
        'A short, clear name for this decision.',
        errors.title
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field(
          'context',
          'Context',
          <textarea
            id="context"
            className="input min-h-[80px] resize-y"
            value={form.context}
            onChange={(e) => update('context', e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, context: true }))}
            placeholder="What situation triggered this decision?"
            maxLength={500}
            aria-invalid={touched.context && !!errors.context}
          />,
          'The background or situation that led to this decision.',
          errors.context
        )}
        {field(
          'reasoning',
          'Reasoning',
          <textarea
            id="reasoning"
            className="input min-h-[80px] resize-y"
            value={form.reasoning}
            onChange={(e) => update('reasoning', e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, reasoning: true }))}
            placeholder="Why did you choose this path?"
            maxLength={1000}
            aria-invalid={touched.reasoning && !!errors.reasoning}
          />,
          'The rationale behind the chosen option.',
          errors.reasoning
        )}
      </div>

      {field(
        'confidence',
        'Confidence',
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              id="confidence"
              type="range"
              min={1}
              max={100}
              value={form.confidence}
              onChange={(e) => update('confidence', Number(e.target.value))}
              className="flex-1 min-w-0 accent-[var(--accent)]"
              aria-invalid={touched.confidence && !!errors.confidence}
            />
            <div className="flex items-center gap-1 shrink-0">
              <input
                type="number"
                min={1}
                max={100}
                value={form.confidence}
                onChange={(e) => update('confidence', Number(e.target.value))}
                className="input w-16 text-center tabular-nums"
              />
              <span className="text-sm text-muted">%</span>
            </div>
          </div>
          <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${form.confidence}%`,
                background:
                  form.confidence >= 70
                    ? '#10B981'
                    : form.confidence >= 50
                    ? '#06B6D4'
                    : form.confidence >= 30
                    ? '#F59E0B'
                    : '#EF4444',
              }}
            />
          </div>
        </div>,
        'How confident are you in this decision? 1 to 100.',
        errors.confidence
      )}

      {field(
        'options',
        'Options',
        <div className="space-y-2">
          {form.options.map((o, i) => (
            <div key={o.id} className="flex items-center gap-2">
              <span className="text-xs text-dim w-5 shrink-0 tabular-nums">{i + 1}.</span>
              <input
                className="input min-w-0"
                value={o.label}
                onChange={(e) => setOption(o.id, e.target.value)}
                placeholder={`Option ${i + 1}`}
                maxLength={250}
                aria-label={`Option ${i + 1}`}
              />
              <button
                type="button"
                onClick={() => removeOption(o.id)}
                disabled={form.options.length <= 2}
                aria-label={`Remove option ${i + 1}`}
                className="p-2 rounded-lg text-dim hover:text-[var(--danger)] hover:bg-[var(--surface-2)] transition-colors disabled:opacity-40 disabled:pointer-events-none shrink-0"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addOption}
            className="btn btn-ghost text-xs mt-1"
          >
            <Plus size={13} />
            Add option
          </button>
        </div>,
        'List the alternatives you considered. At least two are required.',
        errors.options
      )}

      {field(
        'selectedOption',
        'Selected Option',
        <select
          id="selectedOption"
          className="input"
          value={form.selectedOption}
          onChange={(e) => update('selectedOption', e.target.value)}
          aria-invalid={touched.selectedOption && !!errors.selectedOption}
        >
          <option value="">— Choose an option —</option>
          {form.options
            .filter((o) => o.label.trim())
            .map((o) => (
              <option key={o.id} value={o.label}>
                {o.label}
              </option>
            ))}
        </select>,
        'Pick the option you decided to go with.',
        errors.selectedOption
      )}

      {field(
        'tags',
        'Tags',
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              id="tags"
              className="input min-w-0"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Type a tag and press Enter"
              maxLength={50}
            />
            <button type="button" onClick={addTag} className="btn btn-ghost text-xs shrink-0">
              <Plus size={13} />
              Add
            </button>
          </div>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {form.tags.map((t) => (
                <span key={t} className="chip pr-1">
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    aria-label={`Remove tag ${t}`}
                    className="ml-1 rounded-full p-0.5 hover:bg-[var(--surface)] hover:text-[var(--danger)] transition-colors"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>,
        'Group related decisions with tags. Press Enter or comma to add.'
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field(
          'reviewDate',
          'Review Date',
          <input
            id="reviewDate"
            type="date"
            className="input"
            value={form.reviewDate}
            onChange={(e) => update('reviewDate', e.target.value)}
          />,
          'When should you revisit this decision?'
        )}
        {field(
          'reviewStatus',
          'Review Status',
          <select
            id="reviewStatus"
            className="input"
            value={form.reviewStatus}
            onChange={(e) => update('reviewStatus', e.target.value as ReviewStatus)}
          >
            <option value="pending">Pending Review</option>
            <option value="reviewed">Reviewed</option>
          </select>,
          'Where this decision stands in your review cycle.'
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)] flex-wrap">
        <button type="button" onClick={onCancel} className="btn btn-ghost" disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting || !valid}>
          {submitting ? (
            <>
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Saving…
            </>
          ) : initial ? (
            <>
              <Save size={14} />
              Save Changes
            </>
          ) : (
            <>
              <Check size={14} />
              Create Decision
            </>
          )}
        </button>
      </div>
    </form>
  );
}
