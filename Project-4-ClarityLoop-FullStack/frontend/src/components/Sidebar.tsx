import { LayoutDashboard, ListChecks, PlusCircle, BarChart3, Activity, X, Layers } from 'lucide-react';
import type { Page } from '@/App';

interface SidebarProps {
  page: Page;
  onNavigate: (p: Page) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'decisions', label: 'Decisions', icon: ListChecks },
  { id: 'new', label: 'New Decision', icon: PlusCircle },
  { id: 'insights', label: 'Insights', icon: BarChart3 },
  { id: 'activity', label: 'Activity', icon: Activity },
];

export function Sidebar({ page, onNavigate, mobileOpen, onCloseMobile }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-[260px] shrink-0 surface border-r border-[var(--border)] flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Primary navigation"
        style={{ background: 'var(--surface)' }}
      >
        {/* Brand */}
        <div className="flex items-center justify-between gap-2 px-5 h-16 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="flex items-center justify-center rounded-xl shrink-0"
              style={{
                width: 34,
                height: 34,
                background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
                boxShadow: '0 4px 12px -4px rgba(59,130,246,0.5)',
              }}
            >
              <Layers size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight truncate tracking-tight">ClarityLoop</p>
              <p className="text-[11px] text-dim leading-tight truncate">Decision Intelligence</p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            aria-label="Close navigation"
            className="lg:hidden rounded-lg p-1.5 text-dim hover:text-muted hover:bg-[var(--surface-2)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3" aria-label="Main">
          <p className="px-3 pt-2 pb-2 text-[11px] font-semibold text-dim uppercase tracking-wider">
            Workspace
          </p>
          <ul className="space-y-0.5">
            {NAV.map((item) => {
              const active = page === item.id;
              const Icon = item.icon;
              return (
                <li key={item.id} className="relative">
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full"
                      style={{ background: 'var(--accent)' }}
                    />
                  )}
                  <button
                    onClick={() => {
                      onNavigate(item.id);
                      onCloseMobile();
                    }}
                    aria-current={active ? 'page' : undefined}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group"
                    style={{
                      background: active ? 'rgba(59,130,246,0.1)' : 'transparent',
                      color: active ? 'var(--accent)' : 'var(--text-muted)',
                    }}
                  >
                    <Icon
                      size={17}
                      className="shrink-0"
                      style={{ color: active ? 'var(--accent)' : undefined }}
                    />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer / project attribution */}
        <div className="p-3 border-t border-[var(--border)]">
          <div className="surface-2 rounded-xl p-3.5">
            <p className="text-[11px] font-semibold text-dim uppercase tracking-wider mb-2">
              Decode Labs Internship
            </p>
            <p className="text-sm font-semibold leading-tight tracking-tight">ClarityLoop</p>
            <p className="text-xs text-muted leading-tight">Project 4 · Full Stack</p>
            <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-[var(--border)]">
              <div
                className="flex items-center justify-center rounded-full text-xs font-semibold shrink-0"
                style={{
                  width: 30,
                  height: 30,
                  background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
                  color: 'white',
                }}
              >
                MT
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium leading-tight truncate">Mustafa Tahir</p>
                <p className="text-[11px] text-dim leading-tight truncate">Intern Engineer</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
