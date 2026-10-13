import React, { useRef } from 'react';
import { Upload, Sparkles, Image as ImageIcon } from 'lucide-react';

interface HeaderProps {
  onImageSelected: (file: File) => void;
  onSelectSample: (sampleId: string) => void;
  hasImage: boolean;
  onClearImage: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onImageSelected,
  onSelectSample,
  hasImage,
  onClearImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelected(file);
      e.target.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title, single element */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-bold text-base shadow-sm">
            C
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
            Cabe.AI
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <a
            href="#safe-zone-editor"
            className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            Área de Interesse
          </a>
          <a
            href="#formats-feed"
            className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            Feed de Formatos
          </a>
          <button
            onClick={() => onSelectSample('sneaker-campaign')}
            className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer"
          >
            Amostra Esporte
          </button>
          <button
            onClick={() => onSelectSample('event-creative')}
            className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer"
          >
            Amostra Evento
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {hasImage && (
            <button
              onClick={onClearImage}
              className="text-xs font-medium text-slate-400 hover:text-slate-200 px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors whitespace-nowrap shrink-0"
              title="Remover imagem e visualizar formatos em branco"
            >
              Fundo Branco
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload de Imagem</span>
          </button>
        </div>
      </div>
    </header>
  );
};
