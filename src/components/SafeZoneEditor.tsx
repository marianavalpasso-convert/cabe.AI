import React, { useState, useRef, useCallback } from 'react';
import { SafeZone, ImageMetadata } from '../types';
import { Target, Maximize2, Square, ArrowUp, Upload, Eye, EyeOff, Move, Crosshair } from 'lucide-react';

interface SafeZoneEditorProps {
  image: ImageMetadata | null;
  safeZone: SafeZone;
  onSafeZoneChange: (zone: SafeZone) => void;
  onUploadClick: () => void;
  onSelectSample: (id: string) => void;
}

type HandleType = 'create' | 'move' | 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'se' | 'sw';

export const SafeZoneEditor: React.FC<SafeZoneEditorProps> = ({
  image,
  safeZone,
  onSafeZoneChange,
  onUploadClick,
  onSelectSample,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeDrag, setActiveDrag] = useState<{
    handle: HandleType;
    startX: number;
    startY: number;
    initialZone: SafeZone;
    startPointPercent?: { x: number; y: number };
  } | null>(null);

  const [isCollapsed, setIsCollapsed] = useState(false);

  // Quick Presets
  const applyPreset = (preset: 'center' | 'square' | 'top' | 'full') => {
    if (!image) return;
    switch (preset) {
      case 'center':
        onSafeZoneChange({ x: 25, y: 25, width: 50, height: 50 });
        break;
      case 'square': {
        const aspect = image.width / image.height;
        if (aspect >= 1) {
          const sizeH = 50;
          const sizeW = sizeH / aspect;
          onSafeZoneChange({
            x: Math.max(0, 50 - sizeW / 2),
            y: 25,
            width: Math.min(100, sizeW),
            height: sizeH,
          });
        } else {
          const sizeW = 50;
          const sizeH = sizeW * aspect;
          onSafeZoneChange({
            x: 25,
            y: Math.max(0, 50 - sizeH / 2),
            width: sizeW,
            height: Math.min(100, sizeH),
          });
        }
        break;
      }
      case 'top':
        onSafeZoneChange({ x: 20, y: 5, width: 60, height: 40 });
        break;
      case 'full':
        onSafeZoneChange({ x: 0, y: 0, width: 100, height: 100 });
        break;
    }
  };

  // Start dragging handle, edge (aresta) or body
  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    handle: HandleType
  ) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    setActiveDrag({
      handle,
      startX: e.clientX,
      startY: e.clientY,
      initialZone: { ...safeZone },
    });
  };

  // Start creating a new custom safe zone anywhere on the image
  const handleBackdropPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || !image) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const rect = containerRef.current.getBoundingClientRect();
    const clickXPercent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const clickYPercent = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    setActiveDrag({
      handle: 'create',
      startX: e.clientX,
      startY: e.clientY,
      initialZone: { ...safeZone },
      startPointPercent: { x: clickXPercent, y: clickYPercent },
    });
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!activeDrag || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();

      // Creation mode: user clicks and drags freely to define any rectangle
      if (activeDrag.handle === 'create' && activeDrag.startPointPercent) {
        const curXPercent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const curYPercent = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

        const start = activeDrag.startPointPercent;
        const left = Math.min(start.x, curXPercent);
        const top = Math.min(start.y, curYPercent);
        const width = Math.max(2, Math.abs(curXPercent - start.x));
        const height = Math.max(2, Math.abs(curYPercent - start.y));

        onSafeZoneChange({
          x: Math.round(left * 10) / 10,
          y: Math.round(top * 10) / 10,
          width: Math.round(width * 10) / 10,
          height: Math.round(height * 10) / 10,
        });
        return;
      }

      const deltaXPercent = ((e.clientX - activeDrag.startX) / rect.width) * 100;
      const deltaYPercent = ((e.clientY - activeDrag.startY) / rect.height) * 100;

      const init = activeDrag.initialZone;
      let newX = init.x;
      let newY = init.y;
      let newW = init.width;
      let newH = init.height;

      const minSize = 2; // Tamanho mínimo flexível (sem trava de proporção)

      switch (activeDrag.handle) {
        case 'move': {
          newX = Math.min(Math.max(0, init.x + deltaXPercent), 100 - init.width);
          newY = Math.min(Math.max(0, init.y + deltaYPercent), 100 - init.height);
          break;
        }
        // Aresta Leste (Right Edge)
        case 'e': {
          newW = Math.min(Math.max(minSize, init.width + deltaXPercent), 100 - init.x);
          break;
        }
        // Aresta Oeste (Left Edge)
        case 'w': {
          const maxLeftShift = init.width - minSize;
          const clampedDelta = Math.min(maxLeftShift, Math.max(-init.x, deltaXPercent));
          newX = init.x + clampedDelta;
          newW = init.width - clampedDelta;
          break;
        }
        // Aresta Sul (Bottom Edge)
        case 's': {
          newH = Math.min(Math.max(minSize, init.height + deltaYPercent), 100 - init.y);
          break;
        }
        // Aresta Norte (Top Edge)
        case 'n': {
          const maxUpShift = init.height - minSize;
          const clampedDelta = Math.min(maxUpShift, Math.max(-init.y, deltaYPercent));
          newY = init.y + clampedDelta;
          newH = init.height - clampedDelta;
          break;
        }
        case 'se': {
          newW = Math.min(Math.max(minSize, init.width + deltaXPercent), 100 - init.x);
          newH = Math.min(Math.max(minSize, init.height + deltaYPercent), 100 - init.y);
          break;
        }
        case 'sw': {
          const maxLeftShift = init.width - minSize;
          const clampedDeltaX = Math.min(maxLeftShift, Math.max(-init.x, deltaXPercent));
          newX = init.x + clampedDeltaX;
          newW = init.width - clampedDeltaX;
          newH = Math.min(Math.max(minSize, init.height + deltaYPercent), 100 - init.y);
          break;
        }
        case 'ne': {
          newW = Math.min(Math.max(minSize, init.width + deltaXPercent), 100 - init.x);
          const maxUpShift = init.height - minSize;
          const clampedDeltaY = Math.min(maxUpShift, Math.max(-init.y, deltaYPercent));
          newY = init.y + clampedDeltaY;
          newH = init.height - clampedDeltaY;
          break;
        }
        case 'nw': {
          const maxLeftShift = init.width - minSize;
          const clampedDeltaX = Math.min(maxLeftShift, Math.max(-init.x, deltaXPercent));
          newX = init.x + clampedDeltaX;
          newW = init.width - clampedDeltaX;

          const maxUpShift = init.height - minSize;
          const clampedDeltaY = Math.min(maxUpShift, Math.max(-init.y, deltaYPercent));
          newY = init.y + clampedDeltaY;
          newH = init.height - clampedDeltaY;
          break;
        }
      }

      onSafeZoneChange({
        x: Math.round(newX * 10) / 10,
        y: Math.round(newY * 10) / 10,
        width: Math.round(newW * 10) / 10,
        height: Math.round(newH * 10) / 10,
      });
    },
    [activeDrag, onSafeZoneChange]
  );

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeDrag) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Safe capture release
      }
      setActiveDrag(null);
    }
  };

  // Safe zone pixel dimensions
  const pixelW = image ? Math.round((safeZone.width / 100) * image.width) : 0;
  const pixelH = image ? Math.round((safeZone.height / 100) * image.height) : 0;

  return (
    <section id="safe-zone-editor" className="mb-10">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-400/10 text-amber-400 rounded-lg">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <span>Área de Foco Livre</span>
                <span className="text-[11px] font-normal text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Livre & Não-Proporcional
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Arraste qualquer aresta ou clique e arraste na imagem para desenhar o retângulo de foco.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {image && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                {isCollapsed ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Expandir Editor</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Recolher</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {!image ? (
          /* Zero-State: Sem imagem selecionada */
          <div className="p-8 sm:p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-amber-400 shadow-inner">
                <Upload className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Faça o upload da imagem para começar
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Envie uma imagem para desenhar livremente a área de interesse e visualizar os 6 formatos em tempo real.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={onUploadClick}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  Selecionar Arquivo no Computador
                </button>
              </div>

              <div className="pt-6 border-t border-slate-800/80">
                <p className="text-xs text-slate-500 mb-3">
                  Ou teste imediatamente com uma das artes demonstrativas:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => onSelectSample('sneaker-campaign')}
                    className="px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    Campanha de Produto (Velox)
                  </button>
                  <button
                    onClick={() => onSelectSample('event-creative')}
                    className="px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    Banner de Evento & Keynote
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Imagem Carregada: Editor Visual com Bounding Box Interativo Livre */
          !isCollapsed && (
            <div className="p-6">
              {/* Toolbar de Ações Rápidas e Metadados */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-slate-400 font-medium mr-1">Atalhos rápidos:</span>
                  <button
                    onClick={() => applyPreset('center')}
                    className="px-2.5 py-1 text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-md transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Target className="w-3 h-3 text-amber-400" />
                    <span>Centro</span>
                  </button>
                  <button
                    onClick={() => applyPreset('top')}
                    className="px-2.5 py-1 text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-md transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <ArrowUp className="w-3 h-3 text-amber-400" />
                    <span>Superior</span>
                  </button>
                  <button
                    onClick={() => applyPreset('square')}
                    className="px-2.5 py-1 text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-md transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Square className="w-3 h-3 text-amber-400" />
                    <span>Quadrado</span>
                  </button>
                  <button
                    onClick={() => applyPreset('full')}
                    className="px-2.5 py-1 text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-md transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Maximize2 className="w-3 h-3 text-amber-400" />
                    <span>100% Imagem</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 text-slate-400 font-mono tabular-nums">
                  <span>
                    Original: <strong className="text-slate-200">{image.width} × {image.height}px</strong>
                  </span>
                  <span>·</span>
                  <span>
                    Foco Livre: <strong className="text-amber-400">{pixelW} × {pixelH}px</strong> ({safeZone.width}% × {safeZone.height}%)
                  </span>
                </div>
              </div>

              {/* Canvas da Imagem com Seleção Livre */}
              <div className="relative w-full max-w-4xl mx-auto rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center p-2 select-none">
                <div
                  ref={containerRef}
                  onPointerDown={handleBackdropPointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  className="relative cursor-crosshair inline-block max-w-full touch-none"
                  style={{ maxHeight: '520px' }}
                >
                  {/* Imagem Original Base */}
                  <img
                    src={image.src}
                    alt={image.name}
                    className="block max-h-[500px] w-auto object-contain pointer-events-none rounded"
                    draggable={false}
                  />

                  {/* Darkened Scrim Overlay fora da safe zone usando 4 retângulos */}
                  {/* Top */}
                  <div
                    className="absolute bg-slate-950/65 pointer-events-none transition-all duration-75"
                    style={{
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${safeZone.y}%`,
                    }}
                  />
                  {/* Bottom */}
                  <div
                    className="absolute bg-slate-950/65 pointer-events-none transition-all duration-75"
                    style={{
                      top: `${safeZone.y + safeZone.height}%`,
                      left: 0,
                      width: '100%',
                      height: `${100 - (safeZone.y + safeZone.height)}%`,
                    }}
                  />
                  {/* Left */}
                  <div
                    className="absolute bg-slate-950/65 pointer-events-none transition-all duration-75"
                    style={{
                      top: `${safeZone.y}%`,
                      left: 0,
                      width: `${safeZone.x}%`,
                      height: `${safeZone.height}%`,
                    }}
                  />
                  {/* Right */}
                  <div
                    className="absolute bg-slate-950/65 pointer-events-none transition-all duration-75"
                    style={{
                      top: `${safeZone.y}%`,
                      left: `${safeZone.x + safeZone.width}%`,
                      width: `${100 - (safeZone.x + safeZone.width)}%`,
                      height: `${safeZone.height}%`,
                    }}
                  />

                  {/* Caixa da Safe Zone Livre */}
                  <div
                    className="absolute border-2 border-amber-400 bg-amber-400/10 shadow-xl touch-none transition-shadow group select-none"
                    style={{
                      top: `${safeZone.y}%`,
                      left: `${safeZone.x}%`,
                      width: `${safeZone.width}%`,
                      height: `${safeZone.height}%`,
                    }}
                  >
                    {/* Área Central para Arrastar e Reposicionar Livremente */}
                    <div
                      onPointerDown={(e) => handlePointerDown(e, 'move')}
                      className="absolute inset-0 cursor-move"
                      title="Arrastar e posicionar em qualquer local da imagem"
                    />

                    {/* Badge Indicativo */}
                    <div className="absolute top-2 left-2 bg-slate-950/90 text-amber-300 border border-amber-400/40 text-[10px] font-semibold px-2 py-0.5 rounded shadow pointer-events-none flex items-center gap-1 z-10">
                      <Target className="w-2.5 h-2.5 text-amber-400" />
                      <span>Área de Foco</span>
                    </div>

                    {/* Guias Internas 3x3 */}
                    <div className="absolute inset-0 pointer-events-none opacity-25 border-t border-b border-amber-400/40" style={{ top: '33.33%', bottom: '33.33%', height: '33.34%' }} />
                    <div className="absolute inset-0 pointer-events-none opacity-25 border-l border-r border-amber-400/40" style={{ left: '33.33%', right: '33.33%', width: '33.34%' }} />

                    {/* ARESTAS COMPLETAS INTERATIVAS (Ajuste 1: Arrastar as arestas do selecionador livremente) */}
                    {/* Aresta Superior (N) */}
                    <div
                      onPointerDown={(e) => handlePointerDown(e, 'n')}
                      className="absolute -top-2 left-3 right-3 h-4 cursor-ns-resize z-20 hover:bg-amber-400/25 transition-colors flex items-center justify-center"
                      title="Arrastar aresta superior"
                    >
                      <div className="w-12 h-1 bg-amber-400 rounded-full shadow" />
                    </div>

                    {/* Aresta Inferior (S) */}
                    <div
                      onPointerDown={(e) => handlePointerDown(e, 's')}
                      className="absolute -bottom-2 left-3 right-3 h-4 cursor-ns-resize z-20 hover:bg-amber-400/25 transition-colors flex items-center justify-center"
                      title="Arrastar aresta inferior"
                    >
                      <div className="w-12 h-1 bg-amber-400 rounded-full shadow" />
                    </div>

                    {/* Aresta Esquerda (W) */}
                    <div
                      onPointerDown={(e) => handlePointerDown(e, 'w')}
                      className="absolute -left-2 top-3 bottom-3 w-4 cursor-ew-resize z-20 hover:bg-amber-400/25 transition-colors flex items-center justify-center"
                      title="Arrastar aresta esquerda"
                    >
                      <div className="h-12 w-1 bg-amber-400 rounded-full shadow" />
                    </div>

                    {/* Aresta Direita (E) */}
                    <div
                      onPointerDown={(e) => handlePointerDown(e, 'e')}
                      className="absolute -right-2 top-3 bottom-3 w-4 cursor-ew-resize z-20 hover:bg-amber-400/25 transition-colors flex items-center justify-center"
                      title="Arrastar aresta direita"
                    >
                      <div className="h-12 w-1 bg-amber-400 rounded-full shadow" />
                    </div>

                    {/* 4 Alças de Canto para Ajuste Livre Bidimensional */}
                    {/* NW */}
                    <div
                      onPointerDown={(e) => handlePointerDown(e, 'nw')}
                      className="absolute -top-2 -left-2 w-4 h-4 bg-amber-400 border-2 border-slate-950 rounded-sm cursor-nwse-resize shadow-md z-30 hover:scale-125 transition-transform"
                      title="Canto superior esquerdo"
                    />
                    {/* NE */}
                    <div
                      onPointerDown={(e) => handlePointerDown(e, 'ne')}
                      className="absolute -top-2 -right-2 w-4 h-4 bg-amber-400 border-2 border-slate-950 rounded-sm cursor-nesw-resize shadow-md z-30 hover:scale-125 transition-transform"
                      title="Canto superior direito"
                    />
                    {/* SE */}
                    <div
                      onPointerDown={(e) => handlePointerDown(e, 'se')}
                      className="absolute -bottom-2 -right-2 w-4 h-4 bg-amber-400 border-2 border-slate-950 rounded-sm cursor-nwse-resize shadow-md z-30 hover:scale-125 transition-transform"
                      title="Canto inferior direito"
                    />
                    {/* SW */}
                    <div
                      onPointerDown={(e) => handlePointerDown(e, 'sw')}
                      className="absolute -bottom-2 -left-2 w-4 h-4 bg-amber-400 border-2 border-slate-950 rounded-sm cursor-nesw-resize shadow-md z-30 hover:scale-125 transition-transform"
                      title="Canto inferior esquerdo"
                    />
                  </div>
                </div>
              </div>

              {/* Dica de interação clara */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                  <span>Clique e arraste em qualquer ponto para desenhar uma nova área</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5 text-amber-400" />
                  <span>Puxe as 4 arestas amarelas livremente sem trava de proporção</span>
                </span>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
};
