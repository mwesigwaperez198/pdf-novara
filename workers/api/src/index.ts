interface Env {
  DOCUMENTS_BUCKET: R2Bucket;
  SESSIONS_KV: KVNamespace;
  SHARES_KV: KVNamespace;
  ENVIRONMENT: string;
}

interface DocumentMeta {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: number;
  updatedAt: number;
}

interface ShareConfig {
  id: string;
  documentId: string;
  token: string;
  permissions: 'view' | 'comment' | 'edit';
  passwordHash: string | null;
  expiresAt: number | null;
  createdAt: number;
  accessCount: number;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function handleUpload(request: Request, env: Env): Promise<Response> {
  const contentType = request.headers.get('Content-Type') ?? '';
  if (!contentType.includes('multipart/form-data')) {
    return json({ success: false, error: 'Expected multipart form data' }, 400);
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return json({ success: false, error: 'No file provided' }, 400);
  }

  const id = generateId();
  const arrayBuffer = await file.arrayBuffer();

  const meta: DocumentMeta = {
    id,
    name: file.name,
    size: file.size,
    mimeType: file.type,
    uploadedBy: 'anonymous',
    uploadedAt: Date.now(),
    updatedAt: Date.now(),
  };

  await env.DOCUMENTS_BUCKET.put(`docs/${id}/${file.name}`, arrayBuffer, {
    httpMetadata: { contentType: file.type },
  });

  await env.SESSIONS_KV.put(`doc:${id}`, JSON.stringify(meta), {
    expirationTtl: 60 * 60 * 24 * 30,
  });

  return json({ success: true, data: { documentId: id, ...meta } }, 201);
}

async function handleGetDocument(id: string, env: Env): Promise<Response> {
  const metaStr = await env.SESSIONS_KV.get(`doc:${id}`);
  if (!metaStr) {
    return json({ success: false, error: 'Document not found' }, 404);
  }
  const meta: DocumentMeta = JSON.parse(metaStr);
  return json({ success: true, data: meta });
}

async function handleDeleteDocument(id: string, env: Env): Promise<Response> {
  const metaStr = await env.SESSIONS_KV.get(`doc:${id}`);
  if (!metaStr) {
    return json({ success: false, error: 'Document not found' }, 404);
  }

  const objects = await env.DOCUMENTS_BUCKET.list({ prefix: `docs/${id}/` });
  for (const obj of objects.objects) {
    await env.DOCUMENTS_BUCKET.delete(obj.key);
  }

  await env.SESSIONS_KV.delete(`doc:${id}`);
  return json({ success: true, message: 'Document deleted' });
}

async function handleCreateShare(request: Request, env: Env): Promise<Response> {
  const body = await request.json() as {
    documentId: string;
    permissions?: 'view' | 'comment' | 'edit';
    password?: string;
    expiresIn?: number;
  };

  const metaStr = await env.SESSIONS_KV.get(`doc:${body.documentId}`);
  if (!metaStr) {
    return json({ success: false, error: 'Document not found' }, 404);
  }

  const token = generateToken();
  const passwordHash = body.password ? await hashPassword(body.password) : null;

  const share: ShareConfig = {
    id: generateId(),
    documentId: body.documentId,
    token,
    permissions: body.permissions ?? 'view',
    passwordHash,
    expiresAt: body.expiresIn ? Date.now() + body.expiresIn * 1000 : null,
    createdAt: Date.now(),
    accessCount: 0,
  };

  await env.SHARES_KV.put(`share:${token}`, JSON.stringify(share), {
    expirationTtl: body.expiresIn ?? 60 * 60 * 24 * 365,
  });

  return json({
    success: true,
    data: {
      shareUrl: `https://nova-doc.novara.dev/shared/${token}`,
      token,
      expiresAt: share.expiresAt,
    },
  }, 201);
}

async function handleGetShared(token: string, env: Env): Promise<Response> {
  const shareStr = await env.SHARES_KV.get(`share:${token}`);
  if (!shareStr) {
    return json({ success: false, error: 'Share link not found or expired' }, 404);
  }

  const share: ShareConfig = JSON.parse(shareStr);
  if (share.expiresAt && Date.now() > share.expiresAt) {
    return json({ success: false, error: 'Share link has expired' }, 410);
  }

  share.accessCount++;
  await env.SHARES_KV.put(`share:${token}`, JSON.stringify(share));

  const metaStr = await env.SESSIONS_KV.get(`doc:${share.documentId}`);
  if (!metaStr) {
    return json({ success: false, error: 'Document no longer exists' }, 404);
  }

  return json({
    success: true,
    data: {
      document: JSON.parse(metaStr),
      permissions: share.permissions,
      requiresPassword: !!share.passwordHash,
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === '/api/documents' && request.method === 'POST') {
        return handleUpload(request, env);
      }

      const docMatch = path.match(/^\/api\/documents\/([^/]+)$/);
      if (docMatch) {
        const id = docMatch[1];
        if (request.method === 'GET') return handleGetDocument(id, env);
        if (request.method === 'DELETE') return handleDeleteDocument(id, env);
      }

      if (path === '/api/sharing/create' && request.method === 'POST') {
        return handleCreateShare(request, env);
      }

      const shareMatch = path.match(/^\/api\/sharing\/([^/]+)$/);
      if (shareMatch && request.method === 'GET') {
        return handleGetShared(shareMatch[1], env);
      }

      return json({ success: false, error: 'Not found' }, 404);
    } catch (err) {
      console.error('Worker error:', err);
      return json({ success: false, error: 'Internal server error' }, 500);
    }
  },
};
