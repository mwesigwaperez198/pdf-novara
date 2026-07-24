import type { PDFDocument } from '../types/document';
import { PdfRenderer } from './PdfRenderer';
import { PdfEditor } from './PdfEditor';
import { parseDocx } from '../parsers/DocxParser';
import { parseMarkdown } from '../parsers/MarkdownParser';
import { parseText } from '../parsers/TextParser';
import { readFileAsArrayBuffer, generateId } from '../../utils/format';
import { getFormatFromFilename } from '../../utils/file';

export class DocumentManager {
  private renderer: PdfRenderer;
  private editor: PdfEditor;
  private documents: Map<string, PDFDocument> = new Map();
  private documentData: Map<string, ArrayBuffer> = new Map();
  private activeDocId: string | null = null;

  constructor() {
    this.renderer = new PdfRenderer();
    this.editor = new PdfEditor();
  }

  async openFile(file: File): Promise<PDFDocument> {
    const format = getFormatFromFilename(file.name);
    if (!format) throw new Error(`Unsupported file format: ${file.name}`);
    console.log('[NOVA] Reading file as ArrayBuffer...');
    const data = await readFileAsArrayBuffer(file);
    console.log('[NOVA] File read, format:', format, 'size:', data.byteLength);
    let document: PDFDocument;

    switch (format) {
      case 'pdf':
        console.log('[NOVA] Opening PDF...');
        document = await this.openPdf(data, file.name);
        break;
      case 'docx':
        document = await parseDocx(data, file.name);
        break;
      case 'md':
        document = await parseMarkdown(data, file.name);
        break;
      case 'txt':
        document = parseText(data, file.name);
        break;
      default:
        throw new Error(`Parser not implemented for: ${format}`);
    }

    this.documents.set(document.id, document);
    this.documentData.set(document.id, data);
    this.activeDocId = document.id;
    return document;
  }

  private async openPdf(data: ArrayBuffer, name: string): Promise<PDFDocument> {
    console.log('[NOVA] Loading PDF into renderer...');
    await this.renderer.loadDocument(data);
    console.log('[NOVA] PDF loaded, pages:', this.renderer.getPageCount());

    const doc: PDFDocument = {
      id: generateId(),
      name,
      data,
      pages: [],
      metadata: {
        title: name,
        author: '',
        subject: '',
        keywords: [],
        creator: '',
        producer: '',
        creationDate: null,
        modDate: null,
        pageCount: this.renderer.getPageCount(),
      },
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };

    const pageCount = this.renderer.getPageCount();
    for (let i = 0; i < pageCount; i++) {
      const viewport = await this.renderer.getPageViewport(i, 1.0);
      const textContent = await this.renderer.extractTextContent(i);
      doc.pages.push({
        index: i,
        width: viewport.width,
        height: viewport.height,
        rotation: 0,
        viewport,
        textContent,
        annotations: [],
        objects: [],
      });
    }

    return doc;
  }

  getDocument(id: string): PDFDocument | undefined {
    return this.documents.get(id);
  }

  getActiveDocument(): PDFDocument | undefined {
    if (!this.activeDocId) return undefined;
    return this.documents.get(this.activeDocId);
  }

  getActiveDocumentData(): ArrayBuffer | undefined {
    if (!this.activeDocId) return undefined;
    return this.documentData.get(this.activeDocId);
  }

  setActiveDocument(id: string): void {
    if (this.documents.has(id)) {
      this.activeDocId = id;
    }
  }

  getAllDocuments(): PDFDocument[] {
    return Array.from(this.documents.values());
  }

  closeDocument(id: string): void {
    this.documents.delete(id);
    this.documentData.delete(id);
    if (this.activeDocId === id) {
      const remaining = Array.from(this.documents.keys());
      this.activeDocId = remaining[0] ?? null;
    }
  }

  getRenderer(): PdfRenderer {
    return this.renderer;
  }

  getEditor(): PdfEditor {
    return this.editor;
  }

  destroy(): void {
    this.renderer.destroy();
    this.editor.destroy();
    this.documents.clear();
    this.documentData.clear();
    this.activeDocId = null;
  }
}

export const documentManager = new DocumentManager();
