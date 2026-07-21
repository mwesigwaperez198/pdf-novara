import mammoth from 'mammoth';
import type { PDFDocument, TextContentItem } from '../types/document';
import { generateId } from '../../utils/format';

export async function parseDocx(data: ArrayBuffer, filename: string): Promise<PDFDocument> {
  const result = await mammoth.convertToHtml({ arrayBuffer: data });
  const html = result.value;

  const textItems: TextContentItem[] = [];
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  const paragraphs = tempDiv.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th');

  let yOffset = 40;
  paragraphs.forEach((p, idx) => {
    const text = p.textContent?.trim();
    if (text) {
      const isHeading = /^H[1-6]$/.test(p.tagName);
      textItems.push({
        id: generateId(),
        str: text,
        transform: [1, 0, 0, 1, 40, yOffset],
        width: text.length * 8,
        height: isHeading ? 30 : 18,
        fontSize: isHeading ? 24 : 14,
        fontFamily: 'Arial',
        fontWeight: isHeading ? 700 : 400,
        color: '#000000',
        x: 40,
        y: yOffset,
        pageIndex: 0,
      });
      yOffset += isHeading ? 40 : 28;
    }
  });

  const pageHeight = Math.max(1056, yOffset + 80);

  return {
    id: generateId(),
    name: filename,
    data,
    pages: [{
      index: 0,
      width: 816,
      height: pageHeight,
      rotation: 0,
      viewport: { scale: 1, offsetX: 0, offsetY: 0, width: 816, height: pageHeight, transform: [1, 0, 0, -1, 0, pageHeight] },
      textContent: textItems,
      annotations: [],
      objects: [],
    }],
    metadata: {
      title: filename,
      author: '',
      subject: '',
      keywords: [],
      creator: 'Mammoth.js',
      producer: 'NOVA Doc Editor',
      creationDate: new Date(),
      modDate: new Date(),
      pageCount: 1,
    },
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  };
}
