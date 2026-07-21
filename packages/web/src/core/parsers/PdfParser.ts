import type { PDFDocument } from '../types/document';
import { pdfRenderer } from '../engine/PdfRenderer';
import { generateId } from '../../utils/format';

export async function parsePdf(data: ArrayBuffer, filename: string): Promise<PDFDocument> {
  const proxy = await pdfRenderer.loadDocument(data);
  const pageCount = proxy.numPages;
  const pages = [];

  for (let i = 0; i < pageCount; i++) {
    const viewport = await pdfRenderer.getPageViewport(i, 1.0);
    const textContent = await pdfRenderer.extractTextContent(i);

    pages.push({
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

  return {
    id: generateId(),
    name: filename,
    data,
    pages,
    metadata: {
      title: proxy.fingerprints?.[0] ?? filename,
      author: '',
      subject: '',
      keywords: [],
      creator: '',
      producer: '',
      creationDate: null,
      modDate: null,
      pageCount,
    },
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  };
}
