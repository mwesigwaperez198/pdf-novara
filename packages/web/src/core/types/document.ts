export interface PDFDocument {
  id: string;
  name: string;
  data: ArrayBuffer;
  pages: PDFPage[];
  metadata: DocumentMetadata;
  createdAt: number;
  modifiedAt: number;
}

export interface PDFPage {
  index: number;
  width: number;
  height: number;
  rotation: number;
  viewport: PageViewport;
  textContent: TextContentItem[];
  annotations: Annotation[];
  objects: PageObject[];
}

export interface PageViewport {
  scale: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  transform: number[];
}

export interface TextContentItem {
  id: string;
  str: string;
  transform: number[];
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  color: string;
  x: number;
  y: number;
  pageIndex: number;
}

export interface Annotation {
  id: string;
  type: 'text' | 'highlight' | 'underline' | 'stamp' | 'signature';
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  style: AnnotationStyle;
  createdAt: number;
}

export interface AnnotationStyle {
  color: string;
  opacity: number;
  borderWidth: number;
  borderColor: string;
  fontSize: number;
  fontFamily: string;
}

export interface PageObject {
  id: string;
  type: 'image' | 'shape' | 'text' | 'stamp';
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  data: ImageData | ShapeData | TextObjectData;
}

export interface ImageData {
  src: string;
  originalWidth: number;
  originalHeight: number;
}

export interface ShapeData {
  shapeType: 'rectangle' | 'circle' | 'line' | 'arrow';
  strokeColor: string;
  strokeWidth: number;
  fillColor: string;
  fillOpacity: number;
}

export interface TextObjectData {
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  fontStyle: 'normal' | 'italic';
  color: string;
  alignment: 'left' | 'center' | 'right';
  lineHeight: number;
}

export interface DocumentMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string[];
  creator: string;
  producer: string;
  creationDate: Date | null;
  modDate: Date | null;
  pageCount: number;
}

export type SupportedFormat = 'pdf' | 'docx' | 'txt' | 'md' | 'png' | 'jpeg' | 'rtf';

export interface DocumentTab {
  id: string;
  document: PDFDocument;
  isDirty: boolean;
  undoStack: EditorOperation[];
  redoStack: EditorOperation[];
}

export interface EditorOperation {
  id: string;
  type: 'insert' | 'delete' | 'modify' | 'move' | 'rotate' | 'reorder';
  target: string;
  pageIndex: number;
  before: unknown;
  after: unknown;
  timestamp: number;
}

export type ToolType =
  | 'select'
  | 'text'
  | 'draw'
  | 'image'
  | 'shape'
  | 'highlight'
  | 'signature'
  | 'stamp'
  | 'eraser'
  | 'hand';

export interface ToolOptions {
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  opacity: number;
  shapeType: 'rectangle' | 'circle' | 'line' | 'arrow';
}

export interface ShareLink {
  id: string;
  documentId: string;
  token: string;
  permissions: 'view' | 'comment' | 'edit';
  passwordProtected: boolean;
  expiresAt: number | null;
  createdAt: number;
  accessCount: number;
}

export interface CloudDocument {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  uploadedAt: number;
  updatedAt: number;
  shareLink: string | null;
}
