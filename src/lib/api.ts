export type JobStatus = "queued" | "processing" | "done" | "error";

export interface AnalyzeRequest {
  wallet: string;
  question: string;
}

export interface AnalyzeResponse {
  id: string;
  status: JobStatus;
  queue_position?: number;
}

export interface ResultResponse {
  id: string;
  status: JobStatus;
  answer?: string;
  error?: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/v1${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export function createAnalysis(req: AnalyzeRequest): Promise<AnalyzeResponse> {
  return request<AnalyzeResponse>("/analyze", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export function getResult(id: string): Promise<ResultResponse> {
  return request<ResultResponse>(`/result/${encodeURIComponent(id)}`);
}

export interface HistoryRecord {
  date: string;
  wallet: string;
  question: string;
  answer: string;
}

export function getHistory(query?: string, limit = 20): Promise<HistoryRecord[]> {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  params.set("limit", String(limit));
  return request<HistoryRecord[]>(`/history?${params}`);
}

export function getSubscriptions(userId: number): Promise<string[]> {
  return request<string[]>(`/subscriptions?user_id=${userId}`);
}

export function subscribe(userId: number, wallet: string): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>("/subscriptions", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, wallet }),
  });
}

export function unsubscribe(userId: number, wallet: string): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>("/subscriptions", {
    method: "DELETE",
    body: JSON.stringify({ user_id: userId, wallet }),
  });
}

export interface TokenStats {
  mint: string;
  name: string;
  trades: number;
  pnl_sol: number;
  buy_sol: number;
  sell_sol: number;
}

export interface WalletStats {
  total_trades: number;
  buys: number;
  sells: number;
  wins: number;
  losses: number;
  winrate: number;
  avg_profit_pct: number;
  avg_loss_pct: number;
  profit_factor: number;
  net_pnl_sol: number;
  total_fees_sol: number;
  avg_position_sol: number;
  biggest_win_pct: number;
  biggest_loss_pct: number;
  open_positions: number;
  period_from: string;
  period_to: string;
  avg_holding_hours: number;
  tokens?: TokenStats[];
}

export interface TradeRow {
  signature: string;
  date: string;
  kind: string;
  token: string;
  token_name: string;
  quantity: number;
  amount_sol: number;
  price_sol: number;
  pnl_sol: number;
  holding_hours: number;
  fee_sol: number;
}

export interface WalletAnalysis {
  wallet: string;
  stats: WalletStats;
  trades: TradeRow[];
}

export function getWalletAnalysis(address: string): Promise<WalletAnalysis> {
  return request<WalletAnalysis>(`/wallet/${encodeURIComponent(address)}`);
}

export interface SubscriptionInfo {
  wallet: string;
  tier: string;
  questions_left: number;
  expires_at?: string;
  has_access: boolean;
}

export function getSubscription(wallet: string): Promise<SubscriptionInfo> {
  return request<SubscriptionInfo>(`/subscription?wallet=${encodeURIComponent(wallet)}`);
}

export interface Tier {
  id: string;
  name: string;
  sol: number;
  questions: number;
  days: number;
}

export function getTiers(): Promise<Tier[]> {
  return request<Tier[]>("/tiers");
}

export interface PayCreateResponse {
  url: string;
  qr: string;
  tier_id: string;
  amount_sol: number;
  recipient: string;
}

export function createPayment(wallet: string, tier_id: string): Promise<PayCreateResponse> {
  return request<PayCreateResponse>("/pay/create", {
    method: "POST",
    body: JSON.stringify({ wallet, tier_id }),
  });
}

export function getPayStatus(wallet: string): Promise<{ status: string; tier_id?: string; amount_sol?: number; subscription?: SubscriptionInfo }> {
  return request(`/pay/status?wallet=${encodeURIComponent(wallet)}`);
}
