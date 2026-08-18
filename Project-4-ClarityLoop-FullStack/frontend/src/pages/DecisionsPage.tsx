import { useMemo, useState } from 'react';
import { ListChecks, Search, SlidersHorizontal, LayoutGrid, List, ArrowUpDown, X, Eye, Pencil, Trash2 } from 'lucide-react';
import type { Decision } from '@/types';
import { DecisionCard } from '@/components/DecisionCard';
import { DecisionCardSkeleton, RowSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { confidenceLabel } from '@/utils/format';

interface DecisionsPageProps {
  decisions: Decision[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  search: string;
  onSearch: (v: string) => void;
  onView: (d: Decision) => void;
  onEdit: (d: Decision) => void;
  onDelete: (d: Decision) => void;
  onNew: () => void;
}

type SortKey = 'recent' | 'oldest' | 'confidence-high' | 'confidence-low' | 'title';
type View = 'grid' | 'list';

export function DecisionsPage({
  decisions, loading, error, onRetry, search, onSearch, onView, onEdit, onDelete, onNew,
}: DecisionsPageProps) {
  const [tagFilter, setTagFilter] = useState<string>('');
  const [confFilter, setConfFilter] = useState<string>('');
  const [sort, setSort] = useState<SortKey>('recent');
  const [view, setView] = useState<View>('grid');

  const allTags = useMemo(() => {
    const s = new Set<string>();
    decisions.forEach((d) => (d.tags || []).forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [decisions]);

  const filtered = useMemo(() => {
    let list = [...decisions];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          (d.context || '').toLowerCase().includes(q) ||
          (d.reasoning || '').toLowerCase().includes(q) ||
          (d.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }
    if (tagFilter) list = list.filter((d) => (d.tags || []).includes(tagFilter));
    if (confFilter) {
      const v = Number(confFilter);
      list = list.filter((d) => {
        const c = d.confidence || 0;
        if (v === 70) return c >= 70;
        if (v === 50) return c >= 50 && c < 70;
        if (v === 30) return c >= 30 && c < 50;
        if (v === 0) return c < 30;
        return true;
      });
    }
    list.sort((a, b) => {
      switch (sort) {
        case 'oldest':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'confidence-high':
          return (b.confidence || 0) - (a.confidence || 0);
        case 'confidence-low':
          return (a.confidence || 0) - (b.confidence || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });
    return list;
  }, [decisions, search, tagFilter, confFilter, sort]);

  const hasFilters = !!(search || tagFilter || confFilter);

  function clearFilters() {
    onSearch('');
    setTagFilter('');
    setConfFilter('');
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="skeleton h-10 w-40 rounded-lg" />
          <div className="flex gap-2">
            <div className="skeleton h-10 w-32 rounded-lg" />
            <div className="skeleton h-10 w-10 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <DecisionCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <ErrorState
          title="Couldn't load decisions"
          message={error}
          detail="Make sure the backend is running and the API endpoint is reachable."
          onRetry={onRetry}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="card p-3 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search by title, context, or tag…"
            aria-label="Search decisions"
            className="input pl-9"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-1 sm:flex-none min-w-0">
            <SlidersHorizontal size={14} className="text-dim shrink-0" />
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              aria-label="Filter by tag"
              className="input py-2 text-sm w-full sm:w-auto sm:min-w-[120px]"
            >
              <option value="">All tags</option>
              {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <select
            value={confFilter}
            onChange={(e) => setConfFilter(e.target.value)}
            aria-label="Filter by confidence"
            className="input py-2 text-sm w-full sm:w-auto sm:min-w-[130px]"
          >
            <option value="">Any confidence</option>
            <option value="70">High (70+)</option>
            <option value="50">Moderate (50–69)</option>
            <option value="30">Low (30–49)</option>
            <option value="0">Very Low (&lt;30)</option>
          </select>

          <div className="flex items-center gap-1.5 flex-1 sm:flex-none min-w-0">
            <ArrowUpDown size={14} className="text-dim shrink-0" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort decisions"
              className="input py-2 text-sm w-full sm:w-auto sm:min-w-[130px]"
            >
              <option value="recent">Most recent</option>
              <option value="oldest">Oldest first</option>
              <option value="confidence-high">Confidence: high</option>
              <option value="confidence-low">Confidence: low</option>
              <option value="title">Title: A–Z</option>
            </select>
          </div>

          <div className="flex items-center rounded-lg border border-[var(--border)] overflow-hidden shrink-0">
            <button
              onClick={() => setView('grid')}
              aria-label="Grid view"
              aria-pressed={view === 'grid'}
              className="p-2 transition-colors"
              style={{
                background: view === 'grid' ? 'var(--surface-2)' : 'transparent',
                color: view === 'grid' ? 'var(--accent)' : 'var(--text-dim)',
              }}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setView('list')}
              aria-label="List view"
              aria-pressed={view === 'list'}
              className="p-2 transition-colors"
              style={{
                background: view === 'list' ? 'var(--surface-2)' : 'transparent',
                color: view === 'list' ? 'var(--accent)' : 'var(--text-dim)',
              }}
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Results count + active filters */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-muted">
          {filtered.length === decisions.length
            ? `${decisions.length} decision${decisions.length === 1 ? '' : 's'}`
            : `${filtered.length} of ${decisions.length} decisions`}
        </p>
        {hasFilters && (
          <button onClick={clearFilters} className="text-xs text-dim hover:text-muted flex items-center gap-1 transition-colors">
            <X size={12} /> Clear filters
          </button>
        )}
      </div>

      {/* Content */}
      {decisions.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<ListChecks size={28} />}
            title="No decisions yet"
            description="Start documenting important decisions so you can review the reasoning behind them later."
            action={<button onClick={onNew} className="btn btn-primary">Create First Decision</button>}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Search size={24} />}
            title="No matching decisions"
            description="Try adjusting your search or filters to find what you're looking for."
            action={<button onClick={clearFilters} className="btn btn-ghost">Clear filters</button>}
            compact
          />
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((d) => (
            <DecisionCard key={d.id} decision={d} onView={onView} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        <div className="card divide-y divide-[var(--border)] overflow-hidden">
          {filtered.map((d) => {
            const tags = (d.tags || []).slice(0, 3);
            return (
              <div key={d.id} className="flex items-center gap-3 sm:gap-4 p-4 hover:bg-[var(--surface-2)] transition-colors group">
                <div className="hidden sm:flex shrink-0">
                  <div className="text-center">
                    <div className="text-lg font-semibold tabular-nums" style={{ color: d.confidence >= 70 ? '#34D399' : d.confidence >= 50 ? '#22D3EE' : d.confidence >= 30 ? '#FBBF24' : '#F87171' }}>
                      {d.confidence}%
                    </div>
                    <div className="text-[10px] text-dim">{confidenceLabel(d.confidence)}</div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <button onClick={() => onView(d)} className="text-left">
                    <p className="font-medium truncate group-hover:text-[var(--accent)] transition-colors">{d.title}</p>
                    <p className="text-xs text-muted truncate">{d.context || 'No context'}</p>
                  </button>
                </div>
                <div className="hidden md:flex flex-wrap gap-1.5 max-w-[200px]">
                  {tags.map((t, i) => <span key={i} className="chip text-[11px]">{t}</span>)}
                </div>
                <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                  <button onClick={() => onView(d)} aria-label={`View ${d.title}`} className="p-1.5 rounded-lg text-dim hover:text-[var(--accent)] hover:bg-[var(--surface)] transition-colors">
                    <Eye size={15} />
                  </button>
                  <button onClick={() => onEdit(d)} aria-label={`Edit ${d.title}`} className="p-1.5 rounded-lg text-dim hover:text-[var(--accent-cyan)] hover:bg-[var(--surface)] transition-colors">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => onDelete(d)} aria-label={`Delete ${d.title}`} className="p-1.5 rounded-lg text-dim hover:text-[var(--danger)] hover:bg-[var(--surface)] transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
