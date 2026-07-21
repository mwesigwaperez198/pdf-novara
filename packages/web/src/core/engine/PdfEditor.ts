import { PDFDocument, degrees } from 'pdf-lib';
import type { PDFDocument as InternalPDFDocument, PDFPage as InternalPDFPage, PageObject, TextObjectData } from '../types/document';
import { generateId } from '../../utils/format';

export class PdfEditor {
  private pdfDoc: PDFDocument | null = null;
  private internalDoc: InternalPDFDocument | null = null;

  async loadFromBytes(data: ArrayBuffer): Promise<void> {
    this.pdfDoc = await PDFDocument.load(data);
    this.buildInternalDoc();
  }

  private buildInternalDoc(): void {
    if (!this.pdfDoc) return;

    const pageCount = this.pdfDoc.getPageCount();
    const pages: InternalPDFPage[] = [];

    for (let i = 0; i < pageCount; i++) {
      const page = this.pdfDoc.getPage(i);
      const { width, height } = page.getSize();
      pages.push({
        index: i,
        width,
        height,
        rotation: page.getRotation().angle,
        viewport: { scale: 1, offsetX: 0, offsetY: 0, width, height, transform: [1, 0, 0, -1, 0, height] },
        textContent: [],
        annotations: [],
        objects: [],
      });
    }

    const title = this.pdfDoc.getTitle() ?? '';
    const author = this.pdfDoc.getAuthor() ?? '';

    this.internalDoc = {
      id: generateId(),
      name: title || 'Untitled Document',
      data: new ArrayBuffer(0),
      pages,
      metadata: {
        title,
        author,
        subject: this.pdfDoc.getSubject() ?? '',
        keywords: [],
        creator: this.pdfDoc.getCreator() ?? '',
        producer: this.pdfDoc.getProducer() ?? '',
        creationDate: this.pdfDoc.getCreationDate() ?? null,
        modDate: this.pdfDoc.getModificationDate() ?? null,
        pageCount,
      },
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };
  }

  getDocument(): InternalPDFDocument | null {
    return this.internalDoc;
  }

  updateMetadata(updates: Partial<InternalPDFDocument['metadata']>): void {
    if (!this.internalDoc || !this.pdfDoc) return;

    if (updates.title !== undefined) {
      this.pdfDoc.setTitle(updates.title);
      this.internalDoc.metadata.title = updates.title;
    }
    if (updates.author !== undefined) {
      this.pdfDoc.setAuthor(updates.author);
      this.internalDoc.metadata.author = updates.author;
    }
    if (updates.subject !== undefined) {
      this.pdfDoc.setSubject(updates.subject);
      this.internalDoc.metadata.subject = updates.subject;
    }

    this.internalDoc.modifiedAt = Date.now();
  }

  addTextToObject(pageIndex: number, x: number, y: number, textData: TextObjectData): PageObject {
    if (!this.internalDoc) throw new Error('No document loaded');

    const page = this.internalDoc.pages[pageIndex];
    if (!page) throw new Error(`Page ${pageIndex} not found`);

    const obj: PageObject = {
      id: generateId(),
      type: 'text',
      pageIndex,
      x,
      y,
      width: 200,
      height: textData.fontSize * 1.5,
      rotation: 0,
      zIndex: page.objects.length,
      data: textData,
    };

    page.objects.push(obj);
    this.internalDoc.modifiedAt = Date.now();
    return obj;
  }

  modifyTextObject(pageIndex: number, objectId: string, updates: Partial<TextObjectData>): void {
    if (!this.internalDoc) throw new Error('No document loaded');

    const page = this.internalDoc.pages[pageIndex];
    if (!page) throw new Error(`Page ${pageIndex} not found`);

    const obj = page.objects.find((o) => o.id === objectId);
    if (!obj || obj.type !== 'text') throw new Error('Text object not found');

    Object.assign(obj.data, updates);
    this.internalDoc.modifiedAt = Date.now();
  }

  deleteObject(pageIndex: number, objectId: string): void {
    if (!this.internalDoc) throw new Error('No document loaded');

    const page = this.internalDoc.pages[pageIndex];
    if (!page) throw new Error(`Page ${pageIndex} not found`);

    page.objects = page.objects.filter((o) => o.id !== objectId);
    this.internalDoc.modifiedAt = Date.now();
  }

  moveObject(pageIndex: number, objectId: string, newX: number, newY: number): void {
    if (!this.internalDoc) throw new Error('No document loaded');

    const page = this.internalDoc.pages[pageIndex];
    if (!page) throw new Error(`Page ${pageIndex} not found`);

    const obj = page.objects.find((o) => o.id === objectId);
    if (!obj) throw new Error('Object not found');

    obj.x = newX;
    obj.y = newY;
    this.internalDoc.modifiedAt = Date.now();
  }

  rotatePage(pageIndex: number, angle: number): void {
    if (!this.internalDoc || !this.pdfDoc) throw new Error('No document loaded');

    const page = this.pdfDoc.getPage(pageIndex);
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees((currentRotation + angle) % 360));

    this.internalDoc.pages[pageIndex].rotation = (currentRotation + angle) % 360;
    this.internalDoc.modifiedAt = Date.now();
  }

  deletePage(pageIndex: number): void {
    if (!this.internalDoc || !this.pdfDoc) throw new Error('No document loaded');
    if (this.pdfDoc.getPageCount() <= 1) throw new Error('Cannot delete the only page');

    this.pdfDoc.removePage(pageIndex);
    this.internalDoc.pages.splice(pageIndex, 1);
    this.internalDoc.pages.forEach((p, i) => { p.index = i; });
    this.internalDoc.metadata.pageCount = this.pdfDoc.getPageCount();
    this.internalDoc.modifiedAt = Date.now();
  }

  async mergeDocuments(otherData: ArrayBuffer): Promise<void> {
    if (!this.pdfDoc) throw new Error('No document loaded');

    const otherDoc = await PDFDocument.load(otherData);
    const copiedPages = await this.pdfDoc.copyPages(otherDoc, otherDoc.getPageIndices());

    copiedPages.forEach((page) => {
      this.pdfDoc!.addPage(page);
    });

    this.buildInternalDoc();
  }

  async reorderPages(newOrder: number[]): Promise<void> {
    if (!this.internalDoc || !this.pdfDoc) throw new Error('No document loaded');

    const pageCount = this.pdfDoc.getPageCount();
    if (newOrder.length !== pageCount) throw new Error('New order length must match page count');

    const newPdfDoc = await PDFDocument.create();
    const copiedPages = await newPdfDoc.copyPages(this.pdfDoc, newOrder);

    copiedPages.forEach((page) => {
      newPdfDoc.addPage(page);
    });

    this.pdfDoc = newPdfDoc;
    this.buildInternalDoc();
  }

  async applyEdits(): Promise<Uint8Array> {
    if (!this.pdfDoc || !this.internalDoc) throw new Error('No document loaded');

    for (const page of this.internalDoc.pages) {
      if (page.objects.length === 0) continue;

      const pdfPage = this.pdfDoc.getPage(page.index);
      const { height } = pdfPage.getSize();

      for (const obj of page.objects) {
        if (obj.type === 'text') {
          const textData = obj.data as TextObjectData;
          pdfPage.drawText(textData.text, {
            x: obj.x,
            y: height - obj.y - textData.fontSize,
            size: textData.fontSize,
          });
        }
      }
    }

    return this.pdfDoc.save();
  }

  getBytes(): Uint8Array | null {
    if (!this.pdfDoc) return null;
    return this.pdfDoc.save() as unknown as Uint8Array;
  }

  destroy(): void {
    this.pdfDoc = null;
    this.internalDoc = null;
  }
}

export const pdfEditor = new PdfEditor();
