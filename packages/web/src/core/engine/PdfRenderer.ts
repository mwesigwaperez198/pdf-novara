import * as pdfjsLib from 'pdfjs-dist';
import type {
  PDFDocumentProxy,
  TextContent,
  TextItem,
} from 'pdfjs-dist/types/src/display/api';
import type { PageViewport } from '../types/document';
import { generateId } from '../../utils/format';

function setupPdfWorker() {
  try {
    const workerUrl = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
    console.log('[NOVA] pdf.js worker set to:', workerUrl);
  } catch (err) {
    console.warn('[NOVA] Failed to set worker URL via import.meta.url, trying CDN fallback:', err);
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  }
}

setupPdfWorker();

export class PdfRenderer {
  private pdfDocument: PDFDocumentProxy | null = null;
  private pageCache: Map<number, import('pdfjs-dist/types/src/display/api').PDFPageProxy> = new Map();
  private renderedCanvases: Map<number, HTMLCanvasElement> = new Map();

  async loadDocument(data: ArrayBuffer): Promise<PDFDocumentProxy> {
    console.log('[NOVA] PdfRenderer.loadDocument: data size =', data.byteLength);
    this.destroy();
    try {
      const loadingTask = pdfjsLib.getDocument({ data });
      console.log('[NOVA] pdf.js getDocument called, waiting for promise...');
      this.pdfDocument = await loadingTask.promise;
      console.log('[NOVA] PDF loaded successfully, pages:', this.pdfDocument.numPages);
      return this.pdfDocument;
    } catch (err) {
      console.error('[NOVA] PdfRenderer.loadDocument FAILED:', err);
      throw err;
    }
  }

  getDocument(): PDFDocumentProxy | null {
    return this.pdfDocument;
  }

  getPageCount(): number {
    return this.pdfDocument?.numPages ?? 0;
  }

  async getPage(index: number): Promise<import('pdfjs-dist/types/src/display/api').PDFPageProxy> {
    if (!this.pdfDocument) throw new Error('No document loaded');
    if (this.pageCache.has(index)) return this.pageCache.get(index)!;
    const page = await this.pdfDocument.getPage(index);
    this.pageCache.set(index, page);
    return page;
  }

  async getPageViewport(index: number, scale: number = 1.0): Promise<PageViewport> {
    const page = await this.getPage(index + 1);
    const viewport = page.getViewport({ scale });
    return {
      scale,
      offsetX: viewport.offsetX,
      offsetY: viewport.offsetY,
      width: viewport.width,
      height: viewport.height,
      transform: viewport.transform as unknown as number[],
    };
  }

  async renderPageToCanvas(
    pageIndex: number,
    canvas: HTMLCanvasElement,
    scale: number = 1.5,
    rotation: number = 0
  ): Promise<void> {
    const page = await this.getPage(pageIndex + 1);
    const viewport = page.getViewport({ scale, rotation });

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get canvas context');

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: ctx as unknown as CanvasRenderingContext2D,
      viewport,
    }).promise;

    this.renderedCanvases.set(pageIndex, canvas);
  }

  async extractTextContent(pageIndex: number) {
    const page = await this.getPage(pageIndex + 1);
    const content: TextContent = await page.getTextContent();

    return content.items
      .filter((item): item is TextItem => 'str' in item && item.str.trim().length > 0)
      .map((item) => {
        const tx = item.transform;
        const fontSize = Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3]);
        return {
          id: generateId(),
          str: item.str,
          transform: tx as unknown as number[],
          width: item.width,
          height: item.height,
          fontSize,
          fontFamily: item.fontName ?? 'sans-serif',
          fontWeight: 400,
          color: '#000000',
          x: tx[4],
          y: tx[5],
          pageIndex,
        };
      });
  }

  async extractAllTextContent() {
    const pageCount = this.getPageCount();
    const allContent: Awaited<ReturnType<typeof this.extractTextContent>>[] = [];

    for (let i = 0; i < pageCount; i++) {
      const content = await this.extractTextContent(i);
      allContent.push(content);
    }

    return allContent.flat();
  }

  getRenderedCanvas(pageIndex: number): HTMLCanvasElement | undefined {
    return this.renderedCanvases.get(pageIndex);
  }

  destroy(): void {
    this.pageCache.clear();
    this.renderedCanvases.clear();
    if (this.pdfDocument) {
      this.pdfDocument.destroy();
      this.pdfDocument = null;
    }
  }
}

export const pdfRenderer = new PdfRenderer();
