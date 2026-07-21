import type { PDFDocument, TextContentItem } from '../types/document';
import { generateId } from '../../utils/format';

const LINE_HEIGHT = 20;
const PAGE_WIDTH = 816;
const PAGE_HEIGHT = 1056;
const MARGIN = 40;
const CHARS_PER_LINE = 90;

export function parseText(data: ArrayBuffer, filename: string): PDFDocument {
  const decoder = new TextDecoder('utf-8');
  const text = decoder.decode(data);
  const lines = text.split('\n');

  const pages: PDFDocument['pages'] = [];
  let currentPageItems: TextContentItem[] = [];
  let yOffset = MARGIN;
  let pageIndex = 0;

  for (const line of lines) {
    if (yOffset + LINE_HEIGHT > PAGE_HEIGHT - MARGIN) {
      pages.push(createPage(pageIndex, currentPageItems, PAGE_WIDTH, PAGE_HEIGHT));
      pageIndex++;
      currentPageItems = [];
      yOffset = MARGIN;
    }

    const wrappedLines = wrapLine(line, CHARS_PER_LINE);
    for (const wrappedLine of wrappedLines) {
      currentPageItems.push({
        id: generateId(),
        str: wrappedLine,
        transform: [1, 0, 0, 1, MARGIN, yOffset],
        width: wrappedLine.length * 8.4,
        height: LINE_HEIGHT,
        fontSize: 14,
        fontFamily: 'Courier New',
        fontWeight: 400,
        color: '#000000',
        x: MARGIN,
        y: yOffset,
        pageIndex,
      });
      yOffset += LINE_HEIGHT;
    }
  }

  if (currentPageItems.length > 0) {
    pages.push(createPage(pageIndex, currentPageItems, PAGE_WIDTH, PAGE_HEIGHT));
  }

  if (pages.length === 0) {
    pages.push(createPage(0, [], PAGE_WIDTH, PAGE_HEIGHT));
  }

  return {
    id: generateId(),
    name: filename,
    data,
    pages,
    metadata: {
      title: filename,
      author: '',
      subject: '',
      keywords: [],
      creator: '',
      producer: 'NOVA Doc Editor',
      creationDate: new Date(),
      modDate: new Date(),
      pageCount: pages.length,
    },
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  };
}

function createPage(
  index: number,
  items: TextContentItem[],
  width: number,
  height: number
): PDFDocument['pages'][0] {
  return {
    index,
    width,
    height,
    rotation: 0,
    viewport: { scale: 1, offsetX: 0, offsetY: 0, width, height, transform: [1, 0, 0, -1, 0, height] },
    textContent: items,
    annotations: [],
    objects: [],
  };
}

function wrapLine(line: string, maxChars: number): string[] {
  if (line.length <= maxChars) return [line];
  const words = line.split(' ');
  const result: string[] = [];
  let current = '';

  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      if (current) result.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) result.push(current);
  return result.length > 0 ? result : [''];
}
