import type { PDFDocument } from '../types/document';
import { downloadBlob } from '../../utils/format';

export class DocxExporter {
  static async exportDocument(doc: PDFDocument, htmlContent: string): Promise<void> {
    const docxHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          p { margin: 0 0 12px 0; line-height: 1.5; }
          img { max-width: 100%; }
        </style>
      </head>
      <body>${htmlContent}</body>
      </html>
    `;

    const blob = new Blob(['\ufeff', docxHtml], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const name = doc.name.endsWith('.docx') ? doc.name : `${doc.name}.docx`;
    downloadBlob(blob, name);
  }

  static async htmlToDocxBlob(html: string, filename: string): Promise<Blob> {
    const docxHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body>${html}</body>
      </html>
    `;
    return new Blob(['\ufeff', docxHtml], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
  }
}
