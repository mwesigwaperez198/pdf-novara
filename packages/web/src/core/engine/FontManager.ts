interface FontFaceDefinition {
  family: string;
  weight: number;
  style: 'normal' | 'italic';
  url?: string;
  loaded: boolean;
}

export class FontManager {
  private fonts: Map<string, FontFaceDefinition> = new Map();
  private loadedFaces: Set<string> = new Set();

  constructor() {
    this.registerSystemFonts();
  }

  private registerSystemFonts(): void {
    const systemFonts = [
      'Inter', 'Arial', 'Times New Roman', 'Courier New', 'Georgia',
      'Verdana', 'Helvetica', 'Trebuchet MS', 'Palatino', 'Garamond',
    ];
    systemFonts.forEach((font) => {
      this.fonts.set(font, {
        family: font,
        weight: 400,
        style: 'normal',
        loaded: true,
      });
    });
  }

  async loadGoogleFont(family: string, weights: number[] = [400, 500, 600, 700]): Promise<void> {
    const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weights.join(';')}&display=swap`;

    try {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      document.head.appendChild(link);

      await new Promise<void>((resolve, reject) => {
        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`Failed to load font: ${family}`));
      });

      for (const weight of weights) {
        const key = `${family}-${weight}`;
        this.fonts.set(key, {
          family,
          weight,
          style: 'normal',
          loaded: true,
        });
      }

      this.loadedFaces.add(family);
    } catch (error) {
      console.error(`Failed to load Google Font: ${family}`, error);
    }
  }

  async loadCustomFont(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const fontName = file.name.replace(/\.(ttf|otf|woff|woff2)$/i, '');

    const fontFace = new FontFace(fontName, buffer);
    await fontFace.load();
    document.fonts.add(fontFace);

    this.fonts.set(fontName, {
      family: fontName,
      weight: 400,
      style: 'normal',
      loaded: true,
    });

    return fontName;
  }

  getFontFamily(fontName: string): string {
    const entry = Array.from(this.fonts.values()).find((f) => f.family === fontName);
    return entry ? entry.family : fontName;
  }

  getAvailableFonts(): string[] {
    const families = new Set<string>();
    this.fonts.forEach((f) => families.add(f.family));
    return Array.from(families).sort();
  }

  isLoaded(family: string): boolean {
    return this.loadedFaces.has(family);
  }
}

export const fontManager = new FontManager();
