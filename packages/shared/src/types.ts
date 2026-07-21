export interface DocumentMeta {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: number;
  updatedAt: number;
}

export interface ShareConfig {
  id: string;
  documentId: string;
  token: string;
  permissions: 'view' | 'comment' | 'edit';
  passwordHash: string | null;
  expiresAt: number | null;
  createdAt: number;
  accessCount: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
