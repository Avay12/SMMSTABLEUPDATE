import { apiClient } from "@/lib/apiClient";

export interface WhiteLabelPayment {
  data?: {
    track_id: string;
    amount: number;
    pay_amount?: number;
    currency: string;
    pay_currency: string;
    network?: string;
    address?: string;
    qr_code?: string;
    pay_link?: string;
    expired_at?: number;
    date?: number;
    under_paid_coverage?: number;
    rate?: number;
  };
  message?: string;
  error?: unknown;
}

export interface PaymentStatus {
  data?: {
    track_id: string;
    status: string;
    amount: number;
    currency: string;
    address?: string;
    date?: number;
  };
  message?: string;
}

export async function createWhiteLabelPayment(
  amount: number,
  currency: string = 'USDT',
  network?: string
): Promise<WhiteLabelPayment> {
  const response = await apiClient.post('/payment/easypay/create', { amount, currency, network });
  return response.data;
}

export async function checkPayment(trackId: string): Promise<PaymentStatus> {
  // The backend uses webhooks, so we can mock this or just return empty.
  // The frontend should rely on fetching the user's oxa payments to get the updated status.
  return { data: { track_id: trackId, status: "Waiting", amount: 0, currency: "USDT" } };
}

export async function getSupportedCurrencies(): Promise<string[]> {
  // Temporary hardcoded list until backend provides an endpoint
  return ["USDT", "BTC", "ETH", "LTC", "TRX", "BNB", "DOGE", "SOL"];
}
