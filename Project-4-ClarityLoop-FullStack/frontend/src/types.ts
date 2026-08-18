export interface DecisionOption {
  id?: string;
  label: string;
}

export type ReviewStatus = 'pending' | 'reviewed';

export interface Decision {
  id: string | number;
  title: string;
  context: string;
  reasoning: string;
  confidence: number;
  options?: DecisionOption[];
  selectedOption?: string;
  tags?: string[];
  reviewDate?: string | null;
  reviewStatus?: ReviewStatus | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DecisionInput {
  title: string;
  context: string;
  reasoning: string;
  confidence: number;
  options: DecisionOption[];
  selectedOption: string;
  tags?: string[];
  reviewDate?: string | null;
  reviewStatus?: ReviewStatus;
}

export interface HealthStatus {
  ok: boolean;
  status: 'connected' | 'degraded' | 'offline';
  message: string;
  database?: 'connected' | 'disconnected' | 'unknown';
  timestamp?: string;
}
