/**
 * CETCF Frontend API Client
 * Centralized API communication with JWT auth, error handling
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ── Token Management ──────────────────────────────────────────────────

export function getToken(): string | null {
  return localStorage.getItem('cetcf_token');
}

export function setToken(token: string): void {
  localStorage.setItem('cetcf_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('cetcf_token');
  localStorage.removeItem('cetcf_user');
}

export function getUser(): Record<string, unknown> | null {
  const raw = localStorage.getItem('cetcf_user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function setUser(user: Record<string, unknown>): void {
  localStorage.setItem('cetcf_user', JSON.stringify(user));
}

// ── HTTP Helper ───────────────────────────────────────────────────────

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  [key: string]: unknown;
  data?: T;
}

async function request<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
  options: { auth?: boolean; formData?: boolean } = { auth: true }
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {};

  if (!options.formData) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.auth !== false) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (body) {
    fetchOptions.body = options.formData ? (body as FormData) : JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, fetchOptions);

    const data = await response.json() as ApiResponse<T>;

    // If server says 401, clear session
    if (response.status === 401) {
      clearToken();
      window.dispatchEvent(new Event('cetcf:session_expired'));
    }

    return data;
  } catch (err) {
    console.error(`[API] ${method} ${path} failed:`, err);
    return {
      success: false,
      message: 'Network error. Please check your connection and try again.',
    };
  }
}

// ── Auth APIs ─────────────────────────────────────────────────────────

export const authApi = {
  sendOtp: (mobile: string) =>
    request('POST', '/auth/send-otp', { mobile }, { auth: false }),

  verifyOtp: (mobile: string, otp: string) =>
    request('POST', '/auth/verify-otp', { mobile, otp }, { auth: false }),

  partnerLogin: (mobile: string, password: string) =>
    request('POST', '/auth/partner/login', { mobile, password }, { auth: false }),

  adminLogin: (email: string, password: string) =>
    request('POST', '/auth/admin/login', { email, password }, { auth: false }),

  refresh: () => request('POST', '/auth/refresh'),

  logout: () => {
    clearToken();
    return Promise.resolve({ success: true });
  },
};

// ── Candidate APIs ────────────────────────────────────────────────────

export const candidateApi = {
  getProfile: () => request('GET', '/candidates/profile'),

  updateProfile: (data: Record<string, unknown>) =>
    request('PUT', '/candidates/profile', data),

  uploadPhoto: (file: File) => {
    const fd = new FormData();
    fd.append('photo', file);
    return request('POST', '/candidates/profile/photo', fd, { formData: true });
  },

  getDashboard: () => request('GET', '/candidates/dashboard'),

  getCertificates: () => request('GET', '/candidates/certificates'),

  enroll: (tradeId: number, paymentId?: number) =>
    request('POST', '/candidates/enroll', { trade_id: tradeId, payment_id: paymentId }),
};

// ── Trade APIs ────────────────────────────────────────────────────────

export const tradeApi = {
  list: () => request('GET', '/trades', undefined, { auth: false }),
  getById: (id: number) => request('GET', `/trades/${id}`, undefined, { auth: false }),
};

// ── Payment APIs ──────────────────────────────────────────────────────

export const paymentApi = {
  createOrder: (tradeId: number) =>
    request('POST', '/payments/create-order', { trade_id: tradeId }),

  verify: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    trade_id: number;
    payment_record_id?: number;
  }) => request('POST', '/payments/verify', data),

  getReceipt: (paymentId: number) =>
    request('GET', `/payments/receipt/${paymentId}`),

  createBulkOrder: (tradeId: number, candidateUserIds: number[]) =>
    request('POST', '/payments/bulk-order', { trade_id: tradeId, candidate_user_ids: candidateUserIds }),
};

// ── Exam APIs ─────────────────────────────────────────────────────────

export const examApi = {
  start: (tradeId: number) =>
    request('POST', '/exams/start', { trade_id: tradeId }),

  getExam: (examId: number) =>
    request('GET', `/exams/${examId}`),

  saveAnswers: (examId: number, answers: Record<string, string>) =>
    request('POST', `/exams/${examId}/save`, { answers }),

  submit: (examId: number, answers?: Record<string, string>) =>
    request('POST', `/exams/${examId}/submit`, { answers }),

  getResult: (examId: number) =>
    request('GET', `/exams/${examId}/result`),

  reportTabSwitch: (examId: number) =>
    request('POST', `/exams/${examId}/tab-switch`),
};

// ── Certificate APIs ──────────────────────────────────────────────────

export const certificateApi = {
  verify: (certNumber: string) =>
    request('GET', `/certificates/verify/${encodeURIComponent(certNumber)}`, undefined, { auth: false }),

  download: (certId: number) =>
    `${API_BASE_URL}/certificates/${certId}/download`,

  getByNumber: (certNumber: string) =>
    request('GET', `/certificates/by-number/${encodeURIComponent(certNumber)}`),
};

// ── Partner APIs ──────────────────────────────────────────────────────

export const partnerApi = {
  register: (data: Record<string, unknown>) =>
    request('POST', '/partners/register', data, { auth: false }),

  getDashboard: () => request('GET', '/partners/dashboard'),

  enrollSingle: (data: Record<string, unknown>) =>
    request('POST', '/partners/enroll', data),

  getBatches: () => request('GET', '/partners/batches'),

  createBatch: (data: Record<string, unknown>) =>
    request('POST', '/partners/batches', data),

  getEarnings: () => request('GET', '/partners/earnings'),

  getReports: (format: 'json' | 'excel' = 'json') =>
    format === 'excel'
      ? window.open(`${API_BASE_URL}/partners/reports?format=excel`, '_blank')
      : request('GET', '/partners/reports'),

  getBranding: () => request('GET', '/partners/branding'),

  bulkEnroll: (file: File, tradeId: number) => {
    const fd = new FormData();
    fd.append('excel', file);
    fd.append('trade_id', String(tradeId));
    return request('POST', '/partners/bulk-enroll', fd, { formData: true });
  },
};

// ── Admin APIs ────────────────────────────────────────────────────────

export const adminApi = {
  getDashboard: () => request('GET', '/admin/dashboard'),

  getCandidates: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request('GET', `/admin/candidates${qs}`);
  },

  getPartners: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request('GET', `/admin/partners${qs}`);
  },

  updatePartnerStatus: (id: number, status: string, reason?: string) =>
    request('PUT', `/admin/partners/${id}/status`, { status, reason }),

  getQuestions: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request('GET', `/admin/questions${qs}`);
  },

  addQuestion: (data: Record<string, unknown>) =>
    request('POST', '/admin/questions', data),

  bulkImportQuestions: (file: File) => {
    const fd = new FormData();
    fd.append('excel', file);
    return request('POST', '/admin/questions/bulk', fd, { formData: true });
  },

  updateQuestionStatus: (id: number, status: string) =>
    request('PUT', `/admin/questions/${id}/status`, { status }),

  deleteQuestion: (id: number) =>
    request('DELETE', `/admin/questions/${id}`),

  getPayments: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request('GET', `/admin/payments${qs}`);
  },

  getCertificates: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request('GET', `/admin/certificates${qs}`);
  },

  revokeCertificate: (id: number, reason?: string) =>
    request('PUT', `/admin/certificates/${id}/revoke`, { reason }),

  getSettings: () => request('GET', '/admin/settings'),

  updateSettings: (trades: unknown[]) =>
    request('PUT', '/admin/settings', { trades }),

  broadcast: (target: string, message: string, via?: string) =>
    request('POST', '/admin/notifications/broadcast', { target, message, via }),
};

// ── Utilities ─────────────────────────────────────────────────────────

/** Load Razorpay checkout script */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as unknown as Record<string, unknown>).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/** Open Razorpay checkout modal */
export async function initiatePayment(
  tradeId: number,
  userName: string,
  userMobile: string,
  onSuccess: (data: Record<string, unknown>) => void,
  onFailure: (err: string) => void
): Promise<void> {
  const orderRes = await paymentApi.createOrder(tradeId);
  if (!orderRes.success) { onFailure(orderRes.message || 'Could not create order.'); return; }

  const { order, key } = orderRes as Record<string, unknown>;
  const orderObj = order as Record<string, unknown>;
  const paymentRecordId = (orderRes as Record<string, unknown>).paymentRecordId as number | undefined;

  if (orderObj.mock) {
    const verifyRes = await paymentApi.verify({
      razorpay_order_id: String(orderObj.id || ''),
      razorpay_payment_id: `pay_dev_${Date.now()}`,
      razorpay_signature: 'dev_signature',
      trade_id: tradeId,
      payment_record_id: paymentRecordId,
    });

    if (verifyRes.success) {
      onSuccess(verifyRes);
    } else {
      onFailure(verifyRes.message || 'Mock payment verification failed.');
    }
    return;
  }

  const loaded = await loadRazorpayScript();
  if (!loaded) { onFailure('Failed to load payment gateway.'); return; }

  const options = {
    key: key || 'rzp_test_placeholder',
    amount: orderObj.amount,
    currency: 'INR',
    name: 'CETC Foundation',
    description: 'Skill Certification Fee',
    order_id: orderObj.id,
    handler: async (response: Record<string, unknown>) => {
      const verifyRes = await paymentApi.verify({
        razorpay_order_id: response.razorpay_order_id as string,
        razorpay_payment_id: response.razorpay_payment_id as string,
        razorpay_signature: response.razorpay_signature as string,
        trade_id: tradeId,
        payment_record_id: paymentRecordId,
      });
      if (verifyRes.success) {
        onSuccess(verifyRes);
      } else {
        onFailure(verifyRes.message || 'Payment verification failed.');
      }
    },
    prefill: { name: userName, contact: userMobile },
    theme: { color: '#d4af37' },
    modal: { ondismiss: () => onFailure('Payment cancelled by user.') },
  };

  if ((window as unknown as Record<string, unknown>).Razorpay) {
    const rzp = new ((window as unknown as Record<string, { new(o: unknown): { open(): void } }>).Razorpay)(options);
    rzp.open();
  }
}

export default {
  auth: authApi,
  candidates: candidateApi,
  trades: tradeApi,
  payments: paymentApi,
  exams: examApi,
  certificates: certificateApi,
  partners: partnerApi,
  admin: adminApi,
};
