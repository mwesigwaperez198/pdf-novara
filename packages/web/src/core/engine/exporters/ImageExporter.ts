import { downloadBlob } from '../../utils/format';

export class ImageExporter {
  static async canvasToImage(
    canvas: HTMLCanvasElement,
    format: 'png' | 'jpeg' = 'png',
    quality: number = 0.95
  ): Promise<void> {
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            downloadBlob(blob, `export.${format}`);
          }
          resolve();
        },
        `image/${format}`,
        quality
      );
    });
  }

  static async canvasToBlob(
    canvas: HTMLCanvasElement,
    format: 'png' | 'jpeg' = 'png',
    quality: number = 0.95
  ): Promise<Blob | null> {
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        `image/${format}`,
        quality
      );
    });
  }

  static async renderPageToImage(
    sourceCanvas: HTMLCanvasElement,
    scale: number = 2
  ): Promise<HTMLCanvasElement> {
    const exportCanvas = document.createElement('canvas');
    const ctx = exportCanvas.getContext('2d')!;

    exportCanvas.width = sourceCanvas.width * scale;
    exportCanvas.height = sourceCanvas.height * scale;

    ctx.scale(scale, scale);
    ctx.drawImage(sourceCanvas, 0, 0);

    return exportCanvas;
  }
}
