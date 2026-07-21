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
  private activeDocId: string | null = null;

  constructor() {
    this.renderer = new PdfRenderer();
    this.editor = new PdfEditor();
  }

  async openFile(file: File): Promise<PDFDocument> {
    const format = getFormatFromFilename(file.name);
    if (!format) throw new Error(`Unsupported file format: ${file.name}`);

    const data = await readFileAsArrayBuffer(file);
    let document: PDFDocument;

    switch (format) {
      case 'pdf':
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
    this.activeDocId = document.id;
    return document;
  }

  private async openPdf(data: ArrayBuffer, name: string): Promise<PDFDocument> {
    await this.renderer.loadDocument(data);
    await this.editor.loadFromBytes(data);

    const doc = this.editor.getDocument();
    if (!doc) throw new Error('Failed to parse PDF');

    const pageCount = this.renderer.getPageCount();
    for (let i = 0; i < pageCount; i++) {
      const textContent = await this.renderer.extractTextContent(i);
      doc.pages[i].textContent = textContent;
    }

    doc.id = generateId();
    doc.name = name;
    doc.data = data;

    this.documents.set(doc.id, doc);
    this.activeDocId = doc.id;
    return doc;
  }

  getDocument(id: string): PDFDocument | undefined {
    return this.documents.get(id);
  }

  getActiveDocument(): PDFDocument | undefined {
    if (!this.activeDocId) return undefined;
    return this.documents.get(this.activeDocId);
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
    this.activeDocId = null;
  }
}

export const documentManager = new DocumentManager();
