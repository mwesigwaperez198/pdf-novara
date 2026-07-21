import type { PDFDocument } from '../../types/document';
import { downloadBlob } from '../../../utils/format';

export class PdfExporter {
  static async exportDocument(doc: PDFDocument, data: ArrayBuffer): Promise<void> {
    const blob = new Blob([data], { type: 'application/pdf' });
    const name = doc.name.endsWith('.pdf') ? doc.name : `${doc.name}.pdf`;
    downloadBlob(blob, name);
  }
}
