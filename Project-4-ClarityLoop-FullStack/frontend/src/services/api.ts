// Reusable API service for the ClarityLoop backend.
// Project 4 uses the browser Fetch API with async/await and a single service
// layer so every page shares the same request and error handling behavior.

import type { Decision, DecisionInput, HealthStatus } from '@/types';

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');

export class ApiError extends Error {
  status: number;
  kind:
    | 'network'
    | 'server'
    | 'not_found'
    | 'validation'
    | 'auth'
    | 'database'
    | 'unknown';
  details?: unknown;

  constructor(
    message: string,
    status: number,
    kind: ApiError['kind'],
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.kind = kind;
    this.details = details;
  }
}

function classifyStatus(status: number): ApiError['kind'] {
  if (status === 400 || status === 422) return 'validation';
  if (status === 401 || status === 403) return 'auth';
  if (status === 404) return 'not_found';
  if (status >= 500) return 'server';
  return 'unknown';
}

async function parseBody(res: Response): Promise<any> {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }
  try {
    return await res.text();
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {}),
      },
    });
  } catch (err) {
    throw new ApiError(
      'Unable to reach the ClarityLoop API. Check that the backend server is running and reachable.',
      0,
      'network',
      err instanceof Error ? err.message : undefined
    );
  }

  const body = await parseBody(res);

  if (!res.ok) {
    const kind = classifyStatus(res.status);
    const message =
      (body && typeof body === 'object' && (body as any).message) ||
      (typeof body === 'string' && body) ||
      defaultMessage(kind, res.status);
    throw new ApiError(message, res.status, kind, body);
  }

  return body as T;
}

function defaultMessage(kind: ApiError['kind'], status: number): string {
  switch (kind) {
    case 'network':
      return 'Unable to connect to the ClarityLoop API.';
    case 'validation':
      return 'The request was invalid. Please review the highlighted fields.';
    case 'not_found':
      return 'The requested decision could not be found.';
    case 'auth':
      return 'You are not authorized to perform this action.';
    case 'server':
      return `The ClarityLoop API returned a server error (${status}). Please try again shortly.`;
    case 'database':
      return 'The database is unavailable.';
    default:
      return `Unexpected response from the API (${status}).`;
  }
}

export async function checkHealth(): Promise<HealthStatus> {
  try {
    const body = await request<any>('/api/health', { method: 'GET' });

    // Project 3 returns database metadata as an object when SQL Server is healthy.
    const dbConnected =
      body?.success === true &&
      body?.database &&
      typeof body.database === 'object';

    const db =
      dbConnected ||
      body?.database === 'connected' ||
      body?.dbStatus === 'connected'
        ? 'connected'
        : body?.database === 'disconnected' || body?.dbStatus === 'disconnected'
        ? 'disconnected'
        : 'unknown';

    return {
      ok: body?.success !== false,
      status: db === 'disconnected' ? 'degraded' : 'connected',
      message: body?.message || 'API connected',
      database: db,
      timestamp: body?.timestamp || new Date().toISOString(),
    };
  } catch (err) {
    return {
      ok: false,
      status: 'offline',
      message: err instanceof Error ? err.message : 'Service offline',
      database: 'unknown',
    };
  }
}

function unwrapList(body: any): any[] {
  if (!body) return [];
  if (Array.isArray(body)) return body;
  if (Array.isArray(body.data)) return body.data;
  if (Array.isArray(body.decisions)) return body.decisions;
  if (body && typeof body === 'object' && Array.isArray(body.items)) return body.items;
  return [];
}

function toBackendInput(input: DecisionInput) {
  const optionLabels = (input.options || [])
    .map((option) => option.label.trim())
    .filter(Boolean);

  return {
    title: input.title.trim(),
    context: input.context.trim(),
    reasoning: input.reasoning.trim(),
    confidence: Number(input.confidence),
    options: optionLabels,
    selectedOption: input.selectedOption || optionLabels[0] || '',
    tags: (input.tags || []).map((tag) => tag.trim()).filter(Boolean),
    reviewDate: input.reviewDate || null,
    reviewStatus: input.reviewStatus || 'pending',
  };
}

export async function getDecisions(): Promise<Decision[]> {
  const body = await request<any>('/api/v1/decisions', { method: 'GET' });
  return unwrapList(body).map(normalizeDecision);
}

export async function createDecision(input: DecisionInput): Promise<Decision> {
  const body = await request<any>('/api/v1/decisions', {
    method: 'POST',
    body: JSON.stringify(toBackendInput(input)),
  });
  return normalizeDecision(body?.data ?? body);
}

export async function updateDecision(
  id: string | number,
  input: DecisionInput
): Promise<Decision> {
  const body = await request<any>(`/api/v1/decisions/${encodeURIComponent(String(id))}`, {
    method: 'PUT',
    body: JSON.stringify(toBackendInput(input)),
  });
  return normalizeDecision(body?.data ?? body);
}

export async function deleteDecision(id: string | number): Promise<void> {
  await request<any>(`/api/v1/decisions/${encodeURIComponent(String(id))}`, {
    method: 'DELETE',
  });
}

function normalizeDecision(raw: any): Decision {
  if (!raw) {
    throw new ApiError('The API returned an empty decision record.', 0, 'unknown');
  }

  const rawOptions = Array.isArray(raw.options)
    ? raw.options
    : Array.isArray(raw.Options)
    ? raw.Options
    : [];

  const options = rawOptions.map((o: any) =>
    typeof o === 'string'
      ? { label: o }
      : {
          id: o?.id ?? o?.Id ?? o?.OptionId,
          label: o?.label ?? o?.text ?? o?.OptionText ?? '',
        }
  );

  const selectedFromOptions = rawOptions.find(
    (o: any) => typeof o === 'object' && (o?.isSelected === true || o?.IsSelected === true)
  );

  const rawTags = raw.tags ?? raw.Tags ?? [];
  const tags = Array.isArray(rawTags)
    ? rawTags
        .map((t: any) =>
          typeof t === 'string' ? t : t?.name ?? t?.label ?? t?.TagName ?? ''
        )
        .filter(Boolean)
    : typeof rawTags === 'string'
    ? rawTags.split(',').map((t: string) => t.trim()).filter(Boolean)
    : [];

  const backendStatus =
    raw.reviewStatus ??
    raw.review_status ??
    raw.ReviewStatus ??
    raw.status ??
    raw.Status;

  const reviewStatus =
    backendStatus === 'pending-review' || backendStatus === 'pending'
      ? 'pending'
      : backendStatus === 'reviewed'
      ? 'reviewed'
      : backendStatus;

  return {
    id:
      raw.id ??
      raw.Id ??
      raw._id ??
      raw.decisionId ??
      raw.DecisionId,
    title: raw.title ?? raw.Title ?? raw.name ?? 'Untitled decision',
    context: raw.context ?? raw.Context ?? raw.description ?? '',
    reasoning: raw.reasoning ?? raw.Reasoning ?? raw.rationale ?? '',
    confidence: Number(raw.confidence ?? raw.Confidence ?? 0),
    options,
    selectedOption:
      raw.selectedOption ??
      raw.selected_option ??
      raw.SelectedOption ??
      raw.chosenOption ??
      selectedFromOptions?.label ??
      selectedFromOptions?.text ??
      selectedFromOptions?.OptionText ??
      '',
    tags,
    reviewDate: raw.reviewDate ?? raw.review_date ?? raw.ReviewDate ?? null,
    reviewStatus,
    createdAt: raw.createdAt ?? raw.created_at ?? raw.CreatedAt ?? raw.date,
    updatedAt: raw.updatedAt ?? raw.updated_at ?? raw.UpdatedAt,
  };
}
