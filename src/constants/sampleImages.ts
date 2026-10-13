import { ImageMetadata, SafeZone } from '../types';

// Helper to create reliable SVG Data URIs with sharp graphics and clear focal points
function createSvgDataUri(svgContent: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`;
}

const sample1Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1200" width="1600" height="1200">
  <defs>
    <linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#311042" />
    </linearGradient>
    <radialGradient id="glow1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ec4899" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#ec4899" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="1600" height="1200" fill="url(#bg1)" />
  <circle cx="800" cy="600" r="500" fill="url(#glow1)" />
  
  <!-- Grid decoration lines -->
  <g stroke="#ffffff" stroke-opacity="0.07" stroke-width="1.5">
    <line x1="0" y1="300" x2="1600" y2="300" />
    <line x1="0" y1="600" x2="1600" y2="600" />
    <line x1="0" y1="900" x2="1600" y2="900" />
    <line x1="400" y1="0" x2="400" y2="1200" />
    <line x1="800" y1="0" x2="800" y2="1200" />
    <line x1="1200" y1="0" x2="1200" y2="1200" />
  </g>

  <!-- Editorial Top Left Kicker -->
  <text x="120" y="140" fill="#94a3b8" font-family="sans-serif" font-size="28" font-weight="600" letter-spacing="4">CAMPAANHA STUDIO 2026</text>
  
  <!-- Central Focal Hero Area: Sneaker / Product Silhouette with Label -->
  <g id="focal-object">
    <!-- Focal backdrop disc -->
    <circle cx="800" cy="580" r="260" fill="#ffffff" fill-opacity="0.04" stroke="#ec4899" stroke-width="2" stroke-dasharray="8 8" />
    
    <!-- Stylized Modern Sneaker Shape -->
    <path d="M 520 660 C 530 580, 620 540, 710 520 C 780 500, 890 490, 990 530 C 1050 560, 1090 610, 1100 680 C 1080 730, 970 740, 850 740 C 720 740, 560 740, 520 660 Z" fill="#f43f5e" />
    <path d="M 510 670 C 550 740, 720 750, 850 750 C 980 750, 1090 735, 1110 680 C 1115 710, 1090 750, 980 770 C 850 780, 650 780, 510 670 Z" fill="#ffffff" />
    <!-- Dynamic stripe -->
    <path d="M 640 590 C 720 560, 830 550, 950 590" stroke="#fef08a" stroke-width="18" stroke-linecap="round" fill="none" />
    
    <!-- Brand Focal Badge (THE CRITICAL ELEMENT) -->
    <rect x="660" y="440" width="280" height="64" rx="12" fill="#0f172a" stroke="#f43f5e" stroke-width="3" />
    <text x="800" y="482" fill="#ffffff" font-family="sans-serif" font-size="26" font-weight="bold" text-anchor="middle" letter-spacing="3">★ VELOX SPORT ★</text>
  </g>

  <!-- Peripheral Elements (outside focal zone) -->
  <text x="120" y="1060" fill="#64748b" font-family="sans-serif" font-size="22">Edição Limitada · Coleção Primavera</text>
  <text x="1480" y="1060" fill="#64748b" font-family="sans-serif" font-size="22" text-anchor="end">Performance Ultra Light</text>
</svg>`;

const sample2Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 1400" width="1400" height="1400">
  <defs>
    <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#022c22" />
      <stop offset="60%" stop-color="#064e3b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <radialGradient id="glow2" cx="50%" cy="45%" r="40%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#10b981" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="1400" height="1400" fill="url(#bg2)" />
  <circle cx="700" cy="620" r="480" fill="url(#glow2)" />
  
  <!-- Focal Zone: Geometric Portrait / Icon -->
  <g id="portrait-focal">
    <!-- Avatar head silhouette -->
    <circle cx="700" cy="540" r="180" fill="#fbbf24" />
    <!-- Facial / Glass feature -->
    <rect x="610" y="500" width="180" height="45" rx="20" fill="#0f172a" />
    <circle cx="650" cy="522" r="14" fill="#38bdf8" />
    <circle cx="750" cy="522" r="14" fill="#38bdf8" />
    
    <!-- Torso -->
    <path d="M 440 920 C 470 760, 560 720, 700 720 C 840 720, 930 760, 960 920 Z" fill="#10b981" />
    
    <!-- Title banner inside safe area -->
    <rect x="490" y="960" width="420" height="70" rx="16" fill="#0f172a" stroke="#34d399" stroke-width="3" />
    <text x="700" y="1005" fill="#f8fafc" font-family="sans-serif" font-size="28" font-weight="700" text-anchor="middle" letter-spacing="2">CONFERÊNCIA CREATIVE</text>
  </g>
  
  <text x="700" y="1260" fill="#94a3b8" font-family="sans-serif" font-size="22" text-anchor="middle">18-20 OUTUBRO · SÃO PAULO</text>
</svg>`;

export interface SamplePreset {
  id: string;
  title: string;
  metadata: ImageMetadata;
  defaultSafeZone: SafeZone;
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'sneaker-campaign',
    title: 'Campanha Produto (Velox)',
    metadata: {
      src: createSvgDataUri(sample1Svg),
      name: 'campanha-velox-sport.svg',
      width: 1600,
      height: 1200,
      fileSize: 'Vetor HD (1600×1200)',
    },
    defaultSafeZone: {
      x: 32,
      y: 34,
      width: 36,
      height: 34,
    },
  },
  {
    id: 'event-creative',
    title: 'Keynote & Evento (Creative)',
    metadata: {
      src: createSvgDataUri(sample2Svg),
      name: 'evento-creative-2026.svg',
      width: 1400,
      height: 1400,
      fileSize: 'Vetor HD (1400×1400)',
    },
    defaultSafeZone: {
      x: 31,
      y: 25,
      width: 38,
      height: 52,
    },
  },
];
