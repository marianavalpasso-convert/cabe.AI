export interface FormatSpec {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  aspectRatio: string;
  category: 'Landscape' | 'Square' | 'Vertical' | 'Banner' | 'Mobile';
}

export interface SafeZone {
  x: number; // Percent 0 to 100
  y: number; // Percent 0 to 100
  width: number; // Percent 0 to 100
  height: number; // Percent 0 to 100
}

export interface ImageMetadata {
  src: string;
  name: string;
  width: number;
  height: number;
  fileSize?: string;
}

export interface FormatOffset {
  x: number; // Pixels pan offset
  y: number; // Pixels pan offset
  zoom?: number; // Zoom multiplier (padrão 1.0)
}
