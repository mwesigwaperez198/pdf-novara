# NOVA Doc Editor

> Shaping a New Era of Tech in Uganda

A cloud-ready, cross-platform PDF and document editor built by [NOVARA](https://github.com/novara-ug). Open, edit, convert, and share documents from your browser or desktop.

---

## Features

- **Multi-format support** — Open PDF, DOCX, TXT, Markdown, RTF, PNG, and JPEG files
- **Inline text editing** — Select, modify, or erase existing text inside PDFs
- **Text & shape insertion** — Add new text blocks, rectangles, circles, lines, and images
- **Font management** — System fonts, Google Fonts, and custom TTF/OTF uploads
- **Page manipulation** — Rotate, delete, reorder, and merge pages across documents
- **Export pipeline** — Save as PDF, DOCX, PNG, or JPEG
- **Cloud sharing** — Generate view, comment, or edit links with optional password protection and expiration
- **Offline mode** — Full PWA support with service worker caching
- **Desktop app** — Native Windows (.exe), macOS (.dmg), and Linux (.AppImage) via Tauri
- **Auto-updates** — Desktop app checks GitHub Releases for new versions automatically

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS, Vite |
| PDF Rendering | PDF.js v4 (Mozilla) |
| PDF Editing | PDF-lib |
| State Management | Zustand |
| Desktop Wrapper | Tauri v2 (Rust) |
| Backend API | Cloudflare Workers |
| File Storage | Cloudflare R2 |
| CI/CD | GitHub Actions |

## Getting Started

### Web (Development)

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

Open `http://localhost:5173` in your browser.

### Desktop App

Download the latest release from [GitHub Releases](https://github.com/mwesigwaperez198/pdf-novara/releases).

### Build from Source

```bash
# Install dependencies
pnpm install

# Build web frontend
pnpm --filter @nova/web build

# Build desktop app (requires Rust + Tauri CLI)
cd packages/desktop
cargo tauri build
```

## Project Structure

```
pdf-novara/
├── packages/
│   ├── web/          # React frontend (Vite + TypeScript)
│   ├── desktop/      # Tauri v2 desktop wrapper
│   └── shared/       # Shared types and constants
├── workers/
│   └── api/          # Cloudflare Workers API
└── .github/
    └── workflows/    # CI/CD pipelines
```

## Auto-Updates

The desktop app checks for updates on launch. To release a new version:

```bash
# Update version in tauri.conf.json and Cargo.toml, then:
git tag v0.2.0
git push origin main v0.2.0
```

GitHub Actions builds and publishes the .exe, .dmg, and .AppImage automatically.

## License

MIT

---

Built with care by **Mwesigwa Perez** & the NOVARA team.
