export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UploadResponse {
  documentId: string;
  url: string;
  size: number;
}

export interface ShareRequest {
  documentId: string;
  permissions: 'view' | 'comment' | 'edit';
  password?: string;
  expiresIn?: number;
}

export interface ShareResponse {
  shareUrl: string;
  token: string;
  expiresAt: number | null;
}

export interface UserQuota {
  storageUsed: number;
  storageLimit: number;
  documentsCount: number;
  documentsLimit: number;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}
