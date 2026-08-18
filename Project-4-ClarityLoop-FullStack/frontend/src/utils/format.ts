// Small set of formatting helpers shared across the app.
// Kept dependency-free so the code stays readable for a CS student portfolio.

export function formatDate(value?: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(value?: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function relativeTime(value?: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const sec = Math.round(diff / 1000);
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);
  if (sec < 60) return 'just now';
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  if (day < 7) return `${day}d ago`;
  return formatDate(value) ?? '';
}

export function confidenceLabel(value: number): string {
  if (value >= 85) return 'Very High';
  if (value >= 70) return 'High';
  if (value >= 50) return 'Moderate';
  if (value >= 30) return 'Low';
  return 'Very Low';
}

export function confidenceTone(value: number): {
  color: string;
  bg: string;
  ring: string;
  text: string;
} {
  if (value >= 70)
    return {
      color: '#10B981',
      bg: 'rgba(16,185,129,0.12)',
      ring: 'rgba(16,185,129,0.35)',
      text: '#34D399',
    };
  if (value >= 50)
    return {
      color: '#06B6D4',
      bg: 'rgba(6,182,212,0.12)',
      ring: 'rgba(6,182,212,0.35)',
      text: '#22D3EE',
    };
  if (value >= 30)
    return {
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.12)',
      ring: 'rgba(245,158,11,0.35)',
      text: '#FBBF24',
    };
  return {
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.12)',
    ring: 'rgba(239,68,68,0.35)',
    text: '#F87171',
  };
}

export function reviewStatusMeta(status?: string): {
  label: string;
  color: string;
  bg: string;
  border: string;
} {
  switch (status) {
    case 'reviewed':
    case 'approved':
      return {
        label: 'Reviewed',
        color: '#34D399',
        bg: 'rgba(16,185,129,0.12)',
        border: 'rgba(16,185,129,0.3)',
      };
    case 'in_review':
      return {
        label: 'In Review',
        color: '#22D3EE',
        bg: 'rgba(6,182,212,0.12)',
        border: 'rgba(6,182,212,0.3)',
      };
    case 'rejected':
      return {
        label: 'Rejected',
        color: '#F87171',
        bg: 'rgba(239,68,68,0.12)',
        border: 'rgba(239,68,68,0.3)',
      };
    default:
      return {
        label: 'Pending Review',
        color: '#FBBF24',
        bg: 'rgba(245,158,11,0.12)',
        border: 'rgba(245,158,11,0.3)',
      };
  }
}

export function truncate(text: string | undefined, n = 140): string {
  if (!text) return '';
  return text.length > n ? text.slice(0, n).trimEnd() + '…' : text;
}

export function uniqueId(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function classNames(...xs: (string | false | null | undefined)[]): string {
  return xs.filter(Boolean).join(' ');
}
