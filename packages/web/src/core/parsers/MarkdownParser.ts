import { marked } from 'marked';
import type { PDFDocument, TextContentItem } from '../types/document';
import { generateId } from '../../utils/format';

export async function parseMarkdown(data: ArrayBuffer, filename: string): Promise<PDFDocument> {
  const decoder = new TextDecoder('utf-8');
  const mdText = decoder.decode(data);

  const html = await marked.parse(mdText);

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  const textItems: TextContentItem[] = [];
  let yOffset = 40;

  const processNode = (node: HTMLElement, isHeading = false, level = 0) => {
    const text = node.textContent?.trim();
    if (text && node.children.length === 0) {
      const fontSize = isHeading ? Math.max(16, 28 - level * 3) : 14;
      textItems.push({
        id: generateId(),
        str: text,
        transform: [1, 0, 0, 1, 40, yOffset],
        width: text.length * (fontSize * 0.5),
        height: fontSize * 1.4,
        fontSize,
        fontFamily: 'Arial',
        fontWeight: isHeading ? 700 : 400,
        color: '#000000',
        x: 40,
        y: yOffset,
        pageIndex: 0,
      });
      yOffset += fontSize * 2;
    }

    Array.from(node.children).forEach((child) => {
      if (child instanceof HTMLElement) {
        const tag = child.tagName.toLowerCase();
        const headingMatch = tag.match(/^h([1-6])$/);
        processNode(child, !!headingMatch, headingMatch ? parseInt(headingMatch[1]) : 0);
      }
    });
  };

  processNode(tempDiv);

  if (textItems.length === 0) {
    const lines = mdText.split('\n');
    lines.forEach((line) => {
      if (line.trim()) {
        textItems.push({
          id: generateId(),
          str: line,
          transform: [1, 0, 0, 1, 40, yOffset],
          width: line.length * 7,
          height: 18,
          fontSize: 14,
          fontFamily: 'monospace',
          fontWeight: 400,
          color: '#000000',
          x: 40,
          y: yOffset,
          pageIndex: 0,
        });
        yOffset += 24;
      }
    });
  }

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
      creator: 'marked',
      producer: 'NOVA Doc Editor',
      creationDate: new Date(),
      modDate: new Date(),
      pageCount: 1,
    },
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  };
}
