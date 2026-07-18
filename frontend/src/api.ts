import type { AuthUser } from './auth/AuthContext';
import type { CheckoutResponse, PublicClass, PublicOrderDetail } from './types';

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

type RequestOptions = RequestInit & {
  token?: string | null;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `Request failed with ${response.status}.`;

    try {
      const errorBody = (await response.json()) as { message?: string; error?: string };
      message = errorBody.message ?? errorBody.error ?? message;
    } catch {
      // Keep the status-based message when the response is not JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const authApi = {
  login(email: string, password: string) {
    return request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  me(token: string) {
    return request<AuthUser>('/auth/me', { token });
  },
  logout(token: string) {
    return request<void>('/auth/logout', {
      method: 'POST',
      token,
    });
  },
};

export const publicApi = {
  listClasses() {
    return request<{ classes: PublicClass[] }>('/public/classes');
  },
  checkoutBankTransfer(payload: { customerName: string; email: string; items: Array<{ classId: number }> }) {
    return request<CheckoutResponse>('/public/checkout/bank-transfer', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getOrder(orderId: string) {
    return request<PublicOrderDetail>(`/public/orders/${encodeURIComponent(orderId)}`);
  },
};

export { API_BASE_URL };
