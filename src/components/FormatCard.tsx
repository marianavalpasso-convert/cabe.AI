import React, { useRef, useState, useEffect } from 'react';
import { FormatSpec, ImageMetadata, SafeZone, FormatOffset } from '../types';
import { computeSafeZonePlacement, isSafeZoneFullyVisible } from '../utils/math';
import { RotateCcw, Move, CheckCircle2, AlertTriangle, ZoomIn, ZoomOut } from 'lucide-react';

interface FormatCardProps {
  format: FormatSpec;
  image: ImageMetadata | null;
  safeZone: SafeZone;
  offset: FormatOffset;
  onOffsetChange: (formatId: string, offset: FormatOffset) => void;
  showGuides: boolean;
  onToggleGuides: () => void;
  displayMode: 'fit' | 'actual';
}

export const FormatCard: React.FC<FormatCardProps> = ({
  format,
  image,
  safeZone,
  offset,
  onOffsetChange,
  showGuides,
  displayMode,
}) => {
  const containerWrapperRef = useRef<HTMLDivElement>(null);
  const canvasElementRef = useRef<HTMLDivElement>(null);
  const [wrapperWidth, setWrapperWidth] = useState<number>(800);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ clientX: number; clientY: number; startX: number; startY: number }>({
    clientX: 0,
    clientY: 0,
    startX: 0,
    startY: 0,
  });

  // Measure card container width to scale down large banners like 1920x1080 smoothly
  useEffect(() => {
    const updateWidth = () => {
      if (containerWrapperRef.current) {
        setWrapperWidth(containerWrapperRef.current.clientWidth);
      }
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    if (containerWrapperRef.current) {
      observer.observe(containerWrapperRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const currentZoom = offset.zoom ?? 1.0;

  // Ajuste 2: Zoom interativo com scroll da roda do mouse (wheel)
  useEffect(() => {
    const element = canvasElementRef.current;
    if (!element || !image) return;

    const handleWheel = (e: WheelEvent) => {
      // Impede o scroll vertical da página para dar zoom fluido no banner
      e.preventDefault();
      e.stopPropagation();

      // Rolar para cima (deltaY < 0) => zoom in; Rolar para baixo (deltaY > 0) => zoom out
      const zoomStep = e.deltaY < 0 ? 0.08 : -0.08;
      const nextZoom = Math.min(5.0, Math.max(0.15, Math.round((currentZoom + zoomStep) * 100) / 100));

      onOffsetChange(format.id, {
        ...offset,
        zoom: nextZoom,
      });
    };

    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      element.removeEventListener('wheel', handleWheel);
    };
  }, [image, currentZoom, offset, format.id, onOffsetChange]);

  // Compute scale factor for viewport presentation
  const targetW = format.width;
  const targetH = format.height;

  // In 'fit' mode, scale down if targetW > available wrapperWidth
  // In 'actual' mode, scale is strictly 1.0
  const fitScale = Math.min(1, Math.max(0.2, (wrapperWidth - 32) / targetW));
  const renderScale = displayMode === 'actual' ? 1 : fitScale;

  // Calculate transform and safe zone bounding box in banner coordinates, incorporating userZoom
  const transform = image
    ? computeSafeZonePlacement(targetW, targetH, image.width, image.height, safeZone, currentZoom)
    : null;

  const isSafeZoneInside = transform
    ? isSafeZoneFullyVisible(targetW, targetH, transform.safeZoneRendered, offset.x, offset.y)
    : true;

  // Pointer Drag Handlers for Free Pan
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!image) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startX: offset.x,
      startY: offset.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !image) return;
    const deltaX = (e.clientX - dragStartRef.current.clientX) / renderScale;
    const deltaY = (e.clientY - dragStartRef.current.clientY) / renderScale;

    onOffsetChange(format.id, {
      ...offset,
      x: Math.round(dragStartRef.current.startX + deltaX),
      y: Math.round(dragStartRef.current.startY + deltaY),
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Safe capture release
      }
      setIsDragging(false);
    }
  };

  const handleResetOffset = () => {
    onOffsetChange(format.id, { x: 0, y: 0, zoom: 1.0 });
  };

  const handleManualZoomChange = (delta: number) => {
    const nextZoom = Math.min(5.0, Math.max(0.15, Math.round((currentZoom + delta) * 100) / 100));
    onOffsetChange(format.id, {
      ...offset,
      zoom: nextZoom,
    });
  };

  const isOffsetCustom = offset.x !== 0 || offset.y !== 0 || (offset.zoom !== undefined && offset.zoom !== 1.0);

  return (
    <article
      id={`format-${format.id}`}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md transition-all hover:border-slate-700/80"
    >
      {/* Top Banner Spec Info Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white font-mono tabular-nums">
              {format.name}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({format.aspectRatio})
            </span>
          </div>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-400">
            {format.description}
          </span>
        </div>

        {/* Status & Control Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {image && (
            <>
              {/* Controles de Zoom do Formato (Scroll ou Clique) */}
              <div className="flex items-center bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-xs gap-1 font-mono tabular-nums">
                <button
                  onClick={() => handleManualZoomChange(-0.1)}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                  title="Diminuir zoom (ou scroll do mouse para baixo)"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-1 text-slate-300 font-medium">
                  {Math.round(currentZoom * 100)}%
                </span>
                <button
                  onClick={() => handleManualZoomChange(0.1)}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                  title="Aumentar zoom (ou scroll do mouse para cima)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Indicator if safe zone is fully contained */}
              {isSafeZoneInside ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Área de foco 100% visível</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium bg-amber-400/10 px-2 py-0.5 rounded">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Área de foco cortada</span>
                </div>
              )}

              {/* Reset offset & zoom button */}
              {isOffsetCustom && (
                <button
                  onClick={handleResetOffset}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Restaurar enquadramento e zoom padrão"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Resetar</span>
                </button>
              )}
            </>
          )}

          <span className="text-xs text-slate-500 font-mono">
            {displayMode === 'fit' && renderScale < 1
              ? `Escala: ${Math.round(renderScale * 100)}%`
              : 'Tamanho Real (1:1)'}
          </span>
        </div>
      </div>

      {/* Main Banner Visual Frame */}
      <div
        ref={containerWrapperRef}
        className="w-full flex items-center justify-center overflow-x-auto py-2 bg-slate-950/60 rounded-xl border border-slate-800/60"
      >
        <div
          style={{
            width: targetW * renderScale,
            height: targetH * renderScale,
          }}
          className="relative transition-all duration-75 select-none shrink-0"
        >
          {/* Inner Canvas Container rendered at exact banner dimensions (targetW x targetH) */}
          <div
            ref={canvasElementRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{
              width: targetW,
              height: targetH,
              transform: `scale(${renderScale})`,
              transformOrigin: 'top left',
              backgroundColor: '#FFFFFF', // Solid white background as required
            }}
            className={`relative overflow-hidden border border-slate-300 shadow-md ${
              image ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
            }`}
            title={image ? 'Use o scroll do mouse para dar zoom · Clique e arraste para mover a imagem' : undefined}
          >
            {!image ? (
              /* Regra: "Se não tiver imagem exibir fundo branco sólido" */
              <div className="absolute inset-0 bg-white flex flex-col items-center justify-center text-center p-4">
                <div className="text-slate-400 font-mono text-sm font-semibold tracking-wider">
                  {format.width} × {format.height}
                </div>
                <div className="text-slate-400 text-xs mt-1 font-medium">
                  Fundo Branco Sólido
                </div>
              </div>
            ) : (
              /* Imagem Renderizada com Safe Zone Fit, Zoom e Pan Offset */
              transform && (
                <>
                  {/* Background Solid White Base */}
                  <div className="absolute inset-0 bg-white pointer-events-none" />

                  {/* Imagem Original posicionada e escalada sem distorção */}
                  <img
                    src={image.src}
                    alt={image.name}
                    draggable={false}
                    className="absolute pointer-events-none select-none max-w-none"
                    style={{
                      width: `${transform.renderedWidth}px`,
                      height: `${transform.renderedHeight}px`,
                      left: `${transform.baseX + offset.x}px`,
                      top: `${transform.baseY + offset.y}px`,
                      objectFit: 'fill', // Strictly scaled proportionally via renderedWidth/Height
                    }}
                  />

                  {/* Guia visual opcional da Área de Foco para validação visual */}
                  {showGuides && (
                    <div
                      className="absolute border-2 border-dashed border-amber-500 bg-amber-400/15 pointer-events-none shadow"
                      style={{
                        left: `${transform.safeZoneRendered.x + offset.x}px`,
                        top: `${transform.safeZoneRendered.y + offset.y}px`,
                        width: `${transform.safeZoneRendered.width}px`,
                        height: `${transform.safeZoneRendered.height}px`,
                      }}
                    >
                      <div className="absolute top-1 left-1 bg-amber-500 text-slate-950 font-bold text-[9px] px-1 py-0.2 rounded shadow">
                        Foco
                      </div>
                    </div>
                  )}
                </>
              )
            )}
          </div>
        </div>
      </div>

      {/* Footer Dica: Arraste & Scroll Zoom */}
      {image && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-slate-400">
              <Move className="w-3.5 h-3.5 text-amber-400" />
              <span>Arrastar: Mover imagem livremente</span>
            </span>
            <span className="text-slate-700">·</span>
            <span className="flex items-center gap-1 text-slate-400">
              <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
              <span>Scroll do mouse: Zoom in / Zoom out</span>
            </span>
          </div>

          {isOffsetCustom && (
            <div className="font-mono tabular-nums text-slate-400">
              Pan: X: {offset.x > 0 ? `+${offset.x}` : offset.x}px · Y: {offset.y > 0 ? `+${offset.y}` : offset.y}px · Zoom: {Math.round(currentZoom * 100)}%
            </div>
          )}
        </div>
      )}
    </article>
  );
};
