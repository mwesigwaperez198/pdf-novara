export const API_ROUTES = {
  DOCUMENTS: '/api/documents',
  DOCUMENT_BY_ID: (id: string) => `/api/documents/${id}`,
  SHARE_CREATE: '/api/sharing/create',
  SHARE_BY_TOKEN: (token: string) => `/api/sharing/${token}`,
  AUTH_LOGIN: '/api/auth/login',
  AUTH_REGISTER: '/api/auth/register',
} as const;

export const MAX_UPLOAD_SIZE = 100 * 1024 * 1024; // 100MB
export const RATE_LIMIT = 100; // requests per minute per IP
