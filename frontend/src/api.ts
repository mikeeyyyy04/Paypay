import type { AuthUser } from './auth/AuthContext';
import type {
  CheckoutResponse,
  ClassFormValues,
  ClassItem,
  ManualPaymentMethod,
  OrderItem,
  PublicClass,
  PublicOrderDetail,
  VerificationValues,
} from './types';

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
    return request<{ classes: PublicClass[] }>('/classes');
  },
  getClass(slug: string) {
    return request<{ classItem: PublicClass }>(`/classes/${encodeURIComponent(slug)}`);
  },
  listPaymentMethods() {
    return request<{ paymentMethods: ManualPaymentMethod[] }>('/public/payment-methods');
  },
  checkoutManual(payload: {
    customerName: string;
    email: string;
    paymentMethod: 'gcash' | 'bank_transfer';
    items: Array<{ classId: string }>;
  }) {
    return request<CheckoutResponse>('/public/checkout/manual', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  checkoutGcash(payload: {
    customerName: string;
    email: string;
    paymentMethod: 'gcash';
    items: Array<{ classId: string }>;
  }) {
    return request<CheckoutResponse>('/public/checkout/gcash', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  checkoutPaypal(payload: {
    customerName: string;
    email: string;
    paymentMethod: 'paypal';
    items: Array<{ classId: string }>;
  }) {
    return request<CheckoutResponse>('/public/checkout/paypal/create-order', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  capturePaypalOrder(payload: { paypalOrderId: string }) {
    return request<{ success: boolean; orderNumber: string; message?: string }>(
      '/public/checkout/paypal/capture-order',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
  },

  getOrder(orderId: string) {
    return request<PublicOrderDetail>(`/public/orders/${encodeURIComponent(orderId)}`);
  },
  submitReceipt(orderId: string, payload: {
    referenceNumber: string;
    receiptFile: {
      name: string;
      type: string;
      size: number;
      dataUrl: string;
    };
  }) {
    return request<{ order: OrderItem }>(`/public/orders/${encodeURIComponent(orderId)}/payment-proof`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export const adminOrdersApi = {
  list(token: string) {
    return request<{ orders: OrderItem[] }>('/admin/orders', { token });
  },
  update(token: string, orderId: string, values: VerificationValues) {
    return request<{ order: OrderItem }>(`/admin/orders/${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(values),
    });
  },
};

export const adminClassesApi = {
  list(token: string) {
    return request<{ classes: ClassItem[] }>('/admin/classes', { token });
  },
  create(
  token: string,
  values: Omit<ClassFormValues, "coverImage">
){
    return request<{ classItem: ClassItem }>('/admin/classes', {
      method: 'POST',
      token,
      body: JSON.stringify(values),
    });
  },
  update(
  token: string,
  classId: string,
  values: Omit<ClassFormValues, "coverImage">
) {
    return request<{ classItem: ClassItem }>(`/admin/classes/${encodeURIComponent(classId)}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(values),
    });
  },
delete(token: string, classId: string) {
  return request<void>(`/admin/classes/${encodeURIComponent(classId)}`, {
    method: 'DELETE',
    token,
  });
},

async uploadCover(
  token: string,
  classId: string,
  file: File
) {
  const formData = new FormData();

  formData.append("cover", file);

  const response = await fetch(
    `${API_BASE_URL}/admin/classes/${encodeURIComponent(classId)}/cover`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to upload course cover.");
  }

  return response.json();
},

};

export { API_BASE_URL };

