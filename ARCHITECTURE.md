# NOVA DOC EDITOR — System Architecture Blueprint

> NOVARA | Shaping a New Era of Tech in Uganda
> Lead Developer: Mwesigwa Perez

---

## 1. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │           React 18 + TypeScript + Tailwind CSS         │  │
│  │                                                        │  │
│  │  ┌──────────┐  ┌──────────────────┐  ┌────────────┐  │  │
│  │  │ Toolbar  │  │  Document Canvas  │  │  Sidebar   │  │  │
│  │  │ (Tools)  │  │  (PDF.js Render)  │  │ (Thumbs)   │  │  │
│  │  └──────────┘  └──────────────────┘  └────────────┘  │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │              PDF ENGINE (Core Layer)              │  │  │
│  │  │  ┌───────────────┐    ┌────────────────────────┐ │  │  │
│  │  │  │  PDF.js v4    │    │  PDF-lib               │ │  │  │
│  │  │  │  (Rendering)  │    │  (Creation/Modification)│ │  │  │
│  │  │  └───────────────┘    └────────────────────────┘ │  │  │
│  │  │  ┌───────────────┐    ┌────────────────────────┐ │  │  │
│  │  │  │  Mammoth.js   │    │  marked (Markdown)     │ │  │  │
│  │  │  │  (DOCX Parse) │    │  (MD -> HTML)          │ │  │  │
│  │  │  └───────────────┘    └────────────────────────┘ │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │         Zustand State Management                 │  │  │
│  │  │  documentStore | editorStore | uiStore | cloud   │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │         Service Worker (Workbox/PWA)             │  │  │
│  │  │  Offline cache for assets + previously loaded PDFs│  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
└───────────────────────────┬──────────────────────────────────┘
                            │ HTTPS / WSS (Real-time)
┌───────────────────────────▼──────────────────────────────────┐
│                  CLOUDFLARE EDGE LAYER                       │
│                                                              │
│  ┌─────────────────────┐   ┌────────────────────────────┐   │
│  │  Cloudflare Pages   │   │  Cloudflare Workers (API)  │   │
│  │  (Static Frontend)  │   │  /api/documents/*           │   │
│  │                     │   │  /api/sharing/*             │   │
│  │                     │   │  /api/auth/*                │   │
│  └─────────────────────┘   └────────────────────────────┘   │
│  ┌─────────────────────┐   ┌────────────────────────────┐   │
│  │  Cloudflare R2      │   │  Cloudflare KV             │   │
│  │  (Document Storage) │   │  (Sessions, Cache, Limits) │   │
│  │  Encrypted at rest  │   │                            │   │
│  └─────────────────────┘   └────────────────────────────┘   │
│  ┌─────────────────────┐                                    │
│  │  Durable Objects    │                                    │
│  │  (Real-time collab) │                                    │
│  └─────────────────────┘                                    │
└──────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────┐
│                  TAURI DESKTOP WRAPPER                       │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Rust Backend (Tauri v2)                               │  │
│  │  - Native file system I/O                              │  │
│  │  - System clipboard integration                        │  │
│  │  - Native menu bar & window management                 │  │
│  │  - Auto-updater                                        │  │
│  │  - File association (open .pdf on double-click)        │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  WebView2 (Windows) / WKWebView (macOS/Linux)         │  │
│  │  - Runs the same React frontend                        │  │
│  │  - Bridges Tauri IPC for native features               │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Data Flow Architecture

### 2.1 Document Load Flow
```
User drops file / clicks open
        │
        ▼
FileParser detects format (pdf/docx/txt/md/image)
        │
        ▼
Format-specific parser extracts content
  ├─ PDF → PDF.js renders to canvas + extracts text layer
  ├─ DOCX → Mammoth.js converts to structured HTML
  ├─ MD → marked parses to HTML
  ├─ TXT → Direct text extraction
  └─ Image → Canvas API renders
        │
        ▼
DocumentManager normalizes into internal DocumentState
        │
        ▼
Zustand store updates → UI re-renders with document
```

### 2.2 Document Edit Flow
```
User interacts with canvas (click text, add shape, etc.)
        │
        ▼
EditorTools captures intent (edit/insert/delete)
        │
        ▼
EditorStore tracks operation in history stack (undo/redo)
        │
        ▼
PDF-lib applies modification to document model
        │
        ▼
Canvas re-renders affected region
        │
        ▼
Auto-save debounce → Local IndexedDB + optional cloud sync
```

### 2.3 Document Export Flow
```
User clicks Export → Selects format
        │
        ▼
ExportManager reads current DocumentState
  ├─ PDF → PDF-lib serializes to PDF bytes
  ├─ DOCX → html-docx-js or custom converter
  └─ Image → html2canvas captures page → PNG/JPG
        │
        ▼
Blob created → Download trigger or cloud upload
```

---

## 3. Core Engine Design

### 3.1 PDF Rendering Engine (`PdfRenderer`)
- Wraps PDF.js for canvas-based page rendering
- Manages viewport scaling, zoom levels, and fit-to-page
- Renders text layer overlay for text selection
- Handles high-DPI / Retina display scaling

### 3.2 PDF Editing Engine (`PdfEditor`)
- Wraps PDF-lib for document modification
- Tracks all edits as discrete operations (for undo/redo)
- Handles text block detection, modification, and re-rendering
- Manages image insertion, shape drawing, and annotation overlays

### 3.3 Document Manager (`DocumentManager`)
- Central orchestrator for all document operations
- Maintains the canonical document state
- Coordinates between renderer and editor
- Manages multi-document tabs

### 3.4 Font Manager (`FontManager`)
- Loads and registers system fonts, uploaded TTF/OTF, and Google Fonts
- Maintains a font registry for consistent rendering
- Handles font subsetting for export

---

## 4. State Management (Zustand)

### `documentStore`
```typescript
{
  documents: Document[];        // All open documents
  activeDocumentId: string | null;
  totalPages: number;
  currentPage: number;
  zoom: number;
  // Actions
  openDocument(file: File): void;
  closeDocument(id: string): void;
  setActiveDocument(id: string): void;
  navigateToPage(page: number): void;
  setZoom(level: number): void;
}
```

### `editorStore`
```typescript
{
  activeTool: ToolType;         // 'select' | 'text' | 'draw' | 'image' | 'shape'
  toolOptions: ToolOptions;
  history: Operation[];         // Undo stack
  future: Operation[];          // Redo stack
  selectedElements: string[];
  clipboard: ClipboardData | null;
  // Actions
  setTool(tool: ToolType): void;
  executeOperation(op: Operation): void;
  undo(): void;
  redo(): void;
  copy(): void;
  paste(): void;
}
```

### `uiStore`
```typescript
{
  sidebarOpen: boolean;
  sidebarTab: 'pages' | 'properties' | 'layers' | 'share';
  theme: 'light' | 'dark';
  dialogOpen: string | null;
  toasts: Toast[];
  // Actions
  toggleSidebar(): void;
  setTheme(theme: 'light' | 'dark'): void;
  showToast(message: string, type: ToastType): void;
}
```

### `cloudStore`
```typescript
{
  isAuthenticated: boolean;
  documents: CloudDocument[];
  sharingLinks: SharingLink[];
  storageUsed: number;
  storageLimit: number;
  // Actions
  uploadDocument(doc: Document): Promise<string>;
  generateShareLink(docId: string, permissions: Permissions): Promise<string>;
  syncDocument(docId: string): Promise<void>;
}
```

---

## 5. Cloudflare Infrastructure

### 5.1 Cloudflare Pages
- Hosts the built React frontend (Vite output)
- Automatic CI/CD from GitHub on push
- Custom domain with SSL/TLS (Full Strict)

### 5.2 Cloudflare Workers (API)
```
POST   /api/documents/upload       → Upload document to R2
GET    /api/documents/:id          → Fetch document metadata
DELETE /api/documents/:id          → Delete document
POST   /api/sharing/create         → Generate share link
GET    /api/sharing/:token         → Access shared document
POST   /api/auth/login             → Authenticate user
POST   /api/auth/register          → Register new user
```

### 5.3 Cloudflare R2 (Storage)
- Encrypted document storage (AES-256 at rest)
- 10GB free tier, pay-as-you-go beyond
- No egress fees (unlike S3)
- Document paths: `{userId}/{docId}/{filename}`

### 5.4 Cloudflare KV
- Session tokens and rate limiting
- Document metadata cache
- User preferences and settings

---

## 6. Security Architecture

### 6.1 Transport Security
- TLS 1.3 enforced on all endpoints
- HSTS headers with preload
- Cloudflare SSL certificates auto-managed

### 6.2 Application Security
- Content Security Policy (CSP) headers
- CORS restricted to application domain
- CSRF token validation on state-changing requests
- Input sanitization on all user content

### 6.3 Document Security
- Client-side encryption option before cloud upload
- Password-protected share links (AES-256)
- Time-limited share tokens with expiration
- Access logging for shared documents

### 6.4 Bot / Attack Protection
- Cloudflare Bot Management (free tier)
- Rate limiting via Workers (100 req/min per IP)
- SQL injection prevention (no SQL DB — uses R2/KV)
- XSS prevention via React's automatic escaping + DOMPurify

---

## 7. Desktop Build (Tauri v2)

### Architecture
- Frontend: Same React app loaded in WebView
- Backend: Rust binary handling native OS operations
- IPC Bridge: Typed commands between JS ↔ Rust

### Native Features
- File system read/write (open/save dialogs)
- System clipboard (rich content support)
- Global keyboard shortcuts
- System tray integration
- Auto-updater via GitHub Releases
- File association (.pdf, .docx, .txt, .md)

### Build Targets
| Platform | Output        | Size    |
|----------|---------------|---------|
| Windows  | .exe (NSIS)   | ~8 MB   |
| macOS    | .dmg          | ~10 MB  |
| Linux    | .AppImage     | ~10 MB  |

---

## 8. Offline Architecture

### Service Worker Strategy
- **App Shell**: Cache-first (Vite build assets)
- **PDF.js Worker**: Cache-first (critical for rendering)
- **Fonts**: Stale-while-revalidate
- **API calls**: Network-first with cache fallback
- **Documents**: Cache on open, available offline in IndexedDB

### IndexedDB Storage
- Open document binaries stored locally
- Editor history persisted across sessions
- User preferences and settings

---

## 9. Project Directory Structure

```
nova-doc-editor/
├── .gitignore
├── package.json                          # pnpm workspace root
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── ARCHITECTURE.md
├── AGENTS.md
│
├── packages/
│   ├── web/                              # React Frontend
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── postcss.config.js
│   │   ├── index.html
│   │   ├── public/
│   │   │   ├── favicon.svg
│   │   │   └── manifest.json
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── index.css
│   │       ├── components/
│   │       │   ├── layout/
│   │       │   │   ├── AppShell.tsx
│   │       │   │   ├── Header.tsx
│   │       │   │   └── Sidebar.tsx
│   │       │   ├── toolbar/
│   │       │   │   ├── MainToolbar.tsx
│   │       │   │   ├── FileTools.tsx
│   │       │   │   ├── EditTools.tsx
│   │       │   │   ├── InsertTools.tsx
│   │       │   │   └── PageTools.tsx
│   │       │   ├── canvas/
│   │       │   │   ├── DocumentCanvas.tsx
│   │       │   │   ├── PageRenderer.tsx
│   │       │   │   ├── TextLayer.tsx
│   │       │   │   └── AnnotationLayer.tsx
│   │       │   ├── panels/
│   │       │   │   ├── PageThumbnails.tsx
│   │       │   │   ├── PropertiesPanel.tsx
│   │       │   │   └── SharingPanel.tsx
│   │       │   └── modals/
│   │       │       ├── ShareDialog.tsx
│   │       │       └── ExportDialog.tsx
│   │       ├── core/
│   │       │   ├── engine/
│   │       │   │   ├── PdfRenderer.ts
│   │       │   │   ├── PdfEditor.ts
│   │       │   │   ├── DocumentManager.ts
│   │       │   │   ├── FontManager.ts
│   │       │   │   └── exporters/
│   │       │   │       ├── PdfExporter.ts
│   │       │   │       ├── DocxExporter.ts
│   │       │   │       └── ImageExporter.ts
│   │       │   ├── parsers/
│   │       │   │   ├── PdfParser.ts
│   │       │   │   ├── DocxParser.ts
│   │       │   │   ├── MarkdownParser.ts
│   │       │   │   ├── TextParser.ts
│   │       │   │   └── ImageParser.ts
│   │       │   └── types/
│   │       │       ├── document.ts
│   │       │       ├── editor.ts
│   │       │       └── cloud.ts
│   │       ├── store/
│   │       │   ├── useDocumentStore.ts
│   │       │   ├── useEditorStore.ts
│   │       │   └── useUIStore.ts
│   │       ├── hooks/
│   │       │   ├── usePdfRenderer.ts
│   │       │   ├── useKeyboardShortcuts.ts
│   │       │   ├── useClipboard.ts
│   │       │   └── useDragAndDrop.ts
│   │       └── utils/
│   │           ├── file.ts
│   │           ├── format.ts
│   │           └── constants.ts
│   │
│   ├── desktop/                          # Tauri Desktop Wrapper
│   │   ├── package.json
│   │   ├── src-tauri/
│   │   │   ├── Cargo.toml
│   │   │   ├── tauri.conf.json
│   │   │   ├── build.rs
│   │   │   ├── icons/
│   │   │   └── src/
│   │   │       ├── main.rs
│   │   │       └── lib.rs
│   │   └── capabilities/
│   │
│   └── shared/                           # Shared Types & Utils
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── types.ts
│           └── constants.ts
│
└── workers/                              # Cloudflare Workers
    ├── api/
    │   ├── package.json
    │   ├── wrangler.toml
    │   └── src/
    │       └── index.ts
    └── storage/
        ├── package.json
        ├── wrangler.toml
        └── src/
            └── index.ts
```
