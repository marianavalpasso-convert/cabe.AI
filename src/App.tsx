import React, { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { SafeZoneEditor } from './components/SafeZoneEditor';
import { FormatFeed } from './components/FormatFeed';
import { ImageMetadata, SafeZone, FormatOffset } from './types';
import { SAMPLE_PRESETS } from './constants/sampleImages';
import { TARGET_FORMATS } from './constants/formats';
import { Upload, Info, Image as ImageIcon, Sparkles } from 'lucide-react';

export default function App() {
  const [image, setImage] = useState<ImageMetadata | null>(null);
  const [safeZone, setSafeZone] = useState<SafeZone>({
    x: 25,
    y: 25,
    width: 50,
    height: 50,
  });
  const [offsets, setOffsets] = useState<Record<string, FormatOffset>>({});
  const [isDragOverWindow, setIsDragOverWindow] = useState<boolean>(false);
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);

  // Load a file directly
  const handleLoadImageFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPEG, WebP, SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setImage({
          src,
          name: file.name,
          width: img.naturalWidth || 1200,
          height: img.naturalHeight || 800,
          fileSize: `${(file.size / 1024).toFixed(0)} KB`,
        });

        // Initialize safe zone to central 50%
        setSafeZone({
          x: 25,
          y: 25,
          width: 50,
          height: 50,
        });

        // Reset all format offsets
        setOffsets({});
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, []);

  // Sample preset selection
  const handleSelectSample = useCallback((presetId: string) => {
    const preset = SAMPLE_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setImage(preset.metadata);
      setSafeZone(preset.defaultSafeZone);
      setOffsets({});
    }
  }, []);

  // Clear image (demonstrating pure solid white background rule)
  const handleClearImage = useCallback(() => {
    setImage(null);
    setOffsets({});
  }, []);

  // Offset change per format
  const handleOffsetChange = useCallback((formatId: string, newOffset: FormatOffset) => {
    setOffsets((prev) => ({
      ...prev,
      [formatId]: newOffset,
    }));
  }, []);

  // Reset all format offsets
  const handleResetAllOffsets = useCallback(() => {
    setOffsets({});
  }, []);

  // Drag and drop onto entire page
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverWindow(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverWindow(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverWindow(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleLoadImageFile(file);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950"
    >
      {/* Hidden File Input for Triggering Upload from anywhere */}
      <input
        ref={hiddenFileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleLoadImageFile(file);
            e.target.value = '';
          }
        }}
        className="hidden"
      />

      {/* Full-screen drag overlay indicator */}
      {isDragOverWindow && (
        <div className="fixed inset-0 z-50 bg-amber-400/20 backdrop-blur-sm border-4 border-dashed border-amber-400 flex items-center justify-center pointer-events-none">
          <div className="bg-slate-950/90 text-white px-8 py-6 rounded-2xl border border-amber-400 shadow-2xl text-center space-y-2">
            <Upload className="w-10 h-10 text-amber-400 mx-auto animate-bounce" />
            <p className="text-base font-semibold">Solte a imagem aqui</p>
            <p className="text-xs text-slate-400">PNG, JPG, WebP ou SVG</p>
          </div>
        </div>
      )}

      {/* Top Bar Header */}
      <Header
        onImageSelected={handleLoadImageFile}
        onSelectSample={handleSelectSample}
        hasImage={image !== null}
        onClearImage={handleClearImage}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Step 1 & 2: Safe Zone Editor on Original Image */}
        <SafeZoneEditor
          image={image}
          safeZone={safeZone}
          onSafeZoneChange={setSafeZone}
          onUploadClick={() => hiddenFileInputRef.current?.click()}
          onSelectSample={handleSelectSample}
        />

        {/* Step 3: Vertical Feed of all 6 formats */}
        <FormatFeed
          image={image}
          safeZone={safeZone}
          offsets={offsets}
          onOffsetChange={handleOffsetChange}
          onResetAllOffsets={handleResetAllOffsets}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 bg-slate-950 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Cabe.AI</span>
            <span>·</span>
            <span>Simulador de formatos publicitários para equipes de design</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 font-mono">
            <span>1920×1080</span>
            <span>1080×1080</span>
            <span>300×600</span>
            <span>750×90</span>
            <span>320×100</span>
            <span>970×250</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
