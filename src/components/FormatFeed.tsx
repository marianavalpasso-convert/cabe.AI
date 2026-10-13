import React, { useState } from 'react';
import { TARGET_FORMATS } from '../constants/formats';
import { FormatSpec, ImageMetadata, SafeZone, FormatOffset } from '../types';
import { FormatCard } from './FormatCard';
import { Eye, EyeOff, RotateCcw, Sliders, CheckCircle } from 'lucide-react';

interface FormatFeedProps {
  image: ImageMetadata | null;
  safeZone: SafeZone;
  offsets: Record<string, FormatOffset>;
  onOffsetChange: (formatId: string, offset: FormatOffset) => void;
  onResetAllOffsets: () => void;
}

export const FormatFeed: React.FC<FormatFeedProps> = ({
  image,
  safeZone,
  offsets,
  onOffsetChange,
  onResetAllOffsets,
}) => {
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [displayMode, setDisplayMode] = useState<'fit' | 'actual'>('fit');

  const hasAnyCustomOffset = Object.values(offsets).some(
    (off) => off.x !== 0 || off.y !== 0 || (off.zoom !== undefined && off.zoom !== 1.0)
  );

  return (
    <section id="formats-feed" className="space-y-6">
      {/* Feed Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 sticky top-20 z-30 shadow-lg backdrop-blur-md bg-slate-900/95">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">
              Visualização dos Formatos
            </span>
            <span className="text-xs text-slate-400 font-mono">
              (6 formatos)
            </span>
          </div>

          <span className="hidden sm:inline text-slate-700">|</span>

          {/* Quick jump anchor shortcuts */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
            {TARGET_FORMATS.map((f) => (
              <a
                key={f.id}
                href={`#format-${f.id}`}
                className="hover:text-amber-400 px-1.5 py-0.5 rounded transition-colors font-mono"
              >
                {f.id}
              </a>
            ))}
          </div>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Display Mode Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setDisplayMode('fit')}
              className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                displayMode === 'fit'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ajustar à Tela
            </button>
            <button
              onClick={() => setDisplayMode('actual')}
              className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                displayMode === 'actual'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              100% Tamanho Real
            </button>
          </div>

          {/* Show Guides Toggle */}
          <button
            onClick={() => setShowGuides(!showGuides)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              showGuides
                ? 'bg-amber-400/10 border-amber-400/40 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            {showGuides ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Guias Visíveis</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Guias Ocultas</span>
              </>
            )}
          </button>

          {/* Reset All Positions */}
          {hasAnyCustomOffset && (
            <button
              onClick={onResetAllOffsets}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Restaurar posição inicial calculada para todos os 6 formatos"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Resetar Todos</span>
            </button>
          )}
        </div>
      </div>

      {/* Feed Vertical com Rolagem Contínua de Todos os Formatos */}
      <div className="space-y-6">
        {TARGET_FORMATS.map((format) => (
          <FormatCard
            key={format.id}
            format={format}
            image={image}
            safeZone={safeZone}
            offset={offsets[format.id] || { x: 0, y: 0 }}
            onOffsetChange={onOffsetChange}
            showGuides={showGuides}
            onToggleGuides={() => setShowGuides(!showGuides)}
            displayMode={displayMode}
          />
        ))}
      </div>
    </section>
  );
};
