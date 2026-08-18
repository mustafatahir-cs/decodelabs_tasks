import { useCallback, useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { ToastProvider, useToast } from '@/components/Toast';
import { Modal } from '@/components/Modal';
import { DecisionForm } from '@/components/DecisionForm';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DecisionDrawer } from '@/components/DecisionDrawer';
import { useHealth } from '@/hooks/useHealth';
import { useDecisions } from '@/hooks/useDecisions';
import { OverviewPage } from '@/pages/OverviewPage';
import { DecisionsPage } from '@/pages/DecisionsPage';
import { NewDecisionPage } from '@/pages/NewDecisionPage';
import { InsightsPage } from '@/pages/InsightsPage';
import { ActivityPage } from '@/pages/ActivityPage';
import { deleteDecision, updateDecision } from '@/services/api';
import type { Decision, DecisionInput } from '@/types';

export type Page = 'overview' | 'decisions' | 'new' | 'insights' | 'activity';

function AppInner() {
  const [page, setPage] = useState<Page>('overview');
  const [mobileNav, setMobileNav] = useState(false);
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [viewTarget, setViewTarget] = useState<Decision | null>(null);
  const [editTarget, setEditTarget] = useState<Decision | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Decision | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { health, loading: healthLoading, refresh: refreshHealth } = useHealth();
  const { decisions, loading, error, refresh } = useDecisions();
  const toast = useToast();

  // Theme bootstrap
  useEffect(() => {
    const saved = (localStorage.getItem('clarity-theme') as 'dark' | 'light') || 'dark';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('clarity-theme', next);
      return next;
    });
  }, []);

  const navigate = useCallback((p: Page) => {
    setPage(p);
    if (p !== 'decisions') setSearch('');
  }, []);

  const handleView = useCallback((d: Decision) => setViewTarget(d), []);
  const handleEdit = useCallback((d: Decision) => {
    setViewTarget(null);
    setEditTarget(d);
  }, []);
  const handleDelete = useCallback((d: Decision) => {
    setViewTarget(null);
    setDeleteTarget(d);
  }, []);

  async function handleEditSubmit(input: DecisionInput) {
    if (!editTarget) return;
    setSubmitting(true);
    try {
      await updateDecision(editTarget.id, input);
      toast.success('Decision updated', `"${input.title}" was saved.`);
      setEditTarget(null);
      refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Update failed.';
      toast.error('Could not update decision', msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    try {
      await deleteDecision(deleteTarget.id);
      toast.success('Decision deleted', `"${deleteTarget.title}" was removed.`);
      setDeleteTarget(null);
      refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Delete failed.';
      toast.error('Could not delete decision', msg);
      setDeleteTarget(null);
    }
  }

  return (
    <div className="flex min-h-screen overflow-x-hidden" style={{ background: 'var(--bg)' }}>
      <Sidebar
        page={page}
        onNavigate={navigate}
        mobileOpen={mobileNav}
        onCloseMobile={() => setMobileNav(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col w-full">
        <Topbar
          page={page}
          health={health}
          healthLoading={healthLoading}
          onRefreshHealth={refreshHealth}
          onOpenMobile={() => setMobileNav(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
          search={search}
          onSearch={setSearch}
        />

        <main className="flex-1 p-4 sm:p-6 max-w-[1400px] w-full mx-auto">
          {page === 'overview' && (
            <OverviewPage
              decisions={decisions}
              loading={loading}
              error={error}
              onRetry={refresh}
              onNavigate={navigate}
              onView={handleView}
            />
          )}
          {page === 'decisions' && (
            <DecisionsPage
              decisions={decisions}
              loading={loading}
              error={error}
              onRetry={refresh}
              search={search}
              onSearch={setSearch}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onNew={() => navigate('new')}
            />
          )}
          {page === 'new' && (
            <NewDecisionPage
              onCreated={() => navigate('decisions')}
              onNavigate={navigate}
              onAfterChange={refresh}
            />
          )}
          {page === 'insights' && (
            <InsightsPage
              decisions={decisions}
              loading={loading}
              error={error}
              onRetry={refresh}
            />
          )}
          {page === 'activity' && (
            <ActivityPage
              decisions={decisions}
              loading={loading}
              error={error}
              onRetry={refresh}
            />
          )}
        </main>

        <footer className="px-4 sm:px-6 py-4 text-center text-xs text-dim border-t border-[var(--border)]">
          ClarityLoop · Decode Labs Full Stack Project 4 · Mustafa Tahir
        </footer>
      </div>

      {/* View drawer */}
      <DecisionDrawer
        decision={viewTarget}
        onClose={() => setViewTarget(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Edit modal */}
      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Decision"
        description="Update the fields below and save your changes."
        size="lg"
        labelledBy="edit-title"
      >
        {editTarget && (
          <DecisionForm
            initial={editTarget}
            submitting={submitting}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditTarget(null)}
          />
        )}
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this decision?"
        message="This action cannot be undone. The decision and all of its details will be permanently removed."
        confirmLabel="Delete Decision"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}
