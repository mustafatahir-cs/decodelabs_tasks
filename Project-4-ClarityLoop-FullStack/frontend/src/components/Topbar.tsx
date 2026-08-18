import { Search, Bell, Menu, Sun, Moon, RefreshCw } from 'lucide-react';
import type { HealthStatus } from '@/types';
import type { Page } from '@/App';

interface TopbarProps {
  page: Page;
  health: HealthStatus;
  healthLoading: boolean;
  onRefreshHealth: () => void;
  onOpenMobile: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  search: string;
  onSearch: (v: string) => void;
}

const TITLES: Record<Page, { title: string; subtitle: string }> = {
  overview: { title: 'Overview', subtitle: 'Your decision intelligence at a glance' },
  decisions: { title: 'Decisions', subtitle: 'Browse, filter and manage every decision' },
  new: { title: 'New Decision', subtitle: 'Document a decision and its reasoning' },
  insights: { title: 'Insights', subtitle: 'Patterns across your decision history' },
  activity: { title: 'Activity', subtitle: 'Recent changes across the workspace' },
};

export function Topbar({
  page,
  health,
  healthLoading,
  onRefreshHealth,
  onOpenMobile,
  theme,
  onToggleTheme,
  search,
  onSearch,
}: TopbarProps) {
  const meta = TITLES[page];
  const dot =
    health.status === 'connected'
      ? '#10B981'
      : health.status === 'degraded'
      ? '#F59E0B'
      : '#EF4444';
  const label =
    health.status === 'connected'
      ? health.database === 'connected'
        ? 'API · DB Connected'
        : 'API Connected'
      : health.status === 'degraded'
      ? 'API Degraded'
      : 'Service Offline';

  return (
    <header
      className="sticky top-0 z-30 border-b border-[var(--border)]"
      style={{ background: 'color-mix(in srgb, var(--surface) 88%, transparent)', backdropFilter: 'blur(12px)' }}
    >
      <div className="flex items-center gap-3 px-4 sm:px-6 h-16">
        <button
          onClick={onOpenMobile}
          aria-label="Open navigation"
          className="lg:hidden rounded-lg p-2 text-muted hover:bg-[var(--surface-2)] transition-colors"
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0 flex-1 lg:flex-none">
          <h1 className="text-base sm:text-lg font-semibold leading-tight truncate tracking-tight">{meta.title}</h1>
          <p className="text-xs text-dim leading-tight truncate hidden sm:block">{meta.subtitle}</p>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-auto">
          <div className="relative w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search decisions…"
              aria-label="Search decisions"
              className="input pl-9 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Health pill */}
          <button
            onClick={onRefreshHealth}
            title="Refresh connection"
            aria-label={`API status: ${label}. Click to refresh.`}
            className="flex items-center gap-2 rounded-full pl-2.5 pr-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--surface-2)]"
            style={{
              border: '1px solid var(--border)',
              background: 'var(--surface-2)',
            }}
          >
            <span className="relative flex h-2 w-2">
              {!healthLoading && health.status === 'connected' && (
                <span
                  className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping"
                  style={{ background: dot }}
                />
              )}
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{ background: healthLoading ? '#64748B' : dot }}
              />
            </span>
            <span className="hidden sm:inline">{label}</span>
            <RefreshCw size={11} className={healthLoading ? 'animate-spin text-dim' : 'text-dim'} />
          </button>

          {/* Theme */}
          <button
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            className="rounded-lg p-2 text-muted hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Notifications */}
          <button
            aria-label="Notifications"
            className="relative rounded-lg p-2 text-muted hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors"
          >
            <Bell size={16} />
            <span
              className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full"
              style={{ background: 'var(--accent)' }}
            />
          </button>

          {/* Profile */}
          <div className="flex items-center gap-2 pl-1.5 ml-1 border-l border-[var(--border)]">
            <div
              className="flex items-center justify-center rounded-full text-xs font-semibold shrink-0"
              style={{
                width: 32,
                height: 32,
                background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
                color: 'white',
              }}
            >
              MT
            </div>
            <div className="hidden xl:block leading-tight pr-1">
              <p className="text-xs font-medium">Mustafa Tahir</p>
              <p className="text-[11px] text-dim">Intern Engineer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search decisions…"
            aria-label="Search decisions"
            className="input pl-9 py-2 text-sm"
          />
        </div>
      </div>
    </header>
  );
}
