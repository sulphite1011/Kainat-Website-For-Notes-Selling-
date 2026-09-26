import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Check, RotateCcw, Move, Sparkles } from 'lucide-react';

interface CircularLogoCropperProps {
  imageSrc: string;
  onCropComplete: (croppedDataUrl: string) => void;
  onCancel: () => void;
  isLight?: boolean;
}

export const CircularLogoCropper: React.FC<CircularLogoCropperProps> = ({
  imageSrc,
  onCropComplete,
  onCancel,
  isLight = false,
}) => {
  // Crop window display size
  const CROP_SIZE = 280;

  // Natural image dimensions & base fit scale
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [baseFitScale, setBaseFitScale] = useState<number>(1);

  // Zoom relative to "fit entire image in circle" (1 = entire image fits inside circle without any cutoffs or black bars)
  // Can zoom out to 0.5 (see whole picture with background) or zoom in up to 4.0
  const [zoom, setZoom] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Drag & Pinch Touch state refs
  const dragRef = useRef<{
    isDragging: boolean;
    startX: number;
    startY: number;
    initialPanX: number;
    initialPanY: number;
    initialPinchDistance: number | null;
    initialZoom: number;
  }>({
    isDragging: false,
    startX: 0,
    startY: 0,
    initialPanX: 0,
    initialPanY: 0,
    initialPinchDistance: null,
    initialZoom: 1,
  });

  // Load natural image dimensions and calculate initial fit
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const w = img.naturalWidth || 300;
      const h = img.naturalHeight || 300;
      setNaturalSize({ width: w, height: h });

      // Calculate base scale so image fits centered in circle without cutting off or distortion
      // Using Math.min ensures the ENTIRE image fits inside the circle on first open!
      const fit = CROP_SIZE / Math.max(w, h);
      setBaseFitScale(fit);
      setZoom(1);
      setPanX(0);
      setPanY(0);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Actual rendered pixel dimensions on screen
  const renderedWidth = naturalSize.width * baseFitScale * zoom;
  const renderedHeight = naturalSize.height * baseFitScale * zoom;

  // Generate cropped circular output onto clean canvas
  const generateCrop = useCallback(() => {
    if (!naturalSize.width || !naturalSize.height) return '';

    const OUTPUT_SIZE = 400; // Crisp export resolution
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Clear transparent background
    ctx.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    // Circular clip path
    ctx.save();
    ctx.beginPath();
    ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Scale from CROP_SIZE (280) to OUTPUT_SIZE (400)
    const factor = OUTPUT_SIZE / CROP_SIZE;

    // Draw image centered according to panX, panY, and total scale
    const drawWidth = renderedWidth * factor;
    const drawHeight = renderedHeight * factor;
    const centerX = OUTPUT_SIZE / 2 + panX * factor;
    const centerY = OUTPUT_SIZE / 2 + panY * factor;
    const drawX = centerX - drawWidth / 2;
    const drawY = centerY - drawHeight / 2;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    ctx.restore();

    return canvas.toDataURL('image/png');
  }, [naturalSize, baseFitScale, zoom, panX, panY, renderedWidth, renderedHeight, imageSrc]);

  // Update live preview badge
  useEffect(() => {
    if (!naturalSize.width) return;
    const timer = setTimeout(() => {
      const dataUrl = generateCrop();
      setPreviewDataUrl(dataUrl);
    }, 40);
    return () => clearTimeout(timer);
  }, [generateCrop, naturalSize.width]);

  // --- Touch Gestures (Drag Pan + 2-Finger Pinch to Zoom) ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      dragRef.current.isDragging = true;
      dragRef.current.startX = e.touches[0].clientX;
      dragRef.current.startY = e.touches[0].clientY;
      dragRef.current.initialPanX = panX;
      dragRef.current.initialPanY = panY;
      dragRef.current.initialPinchDistance = null;
    } else if (e.touches.length === 2) {
      // Pinch to zoom initialization
      dragRef.current.isDragging = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      dragRef.current.initialPinchDistance = Math.hypot(dx, dy);
      dragRef.current.initialZoom = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && dragRef.current.isDragging) {
      const dx = e.touches[0].clientX - dragRef.current.startX;
      const dy = e.touches[0].clientY - dragRef.current.startY;
      setPanX(dragRef.current.initialPanX + dx);
      setPanY(dragRef.current.initialPanY + dy);
    } else if (e.touches.length === 2 && dragRef.current.initialPinchDistance !== null) {
      // 2-finger pinch
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDistance = Math.hypot(dx, dy);
      const ratio = currentDistance / dragRef.current.initialPinchDistance;
      const newZoom = Math.min(4.0, Math.max(0.4, dragRef.current.initialZoom * ratio));
      setZoom(newZoom);
    }
  };

  const handleTouchEnd = () => {
    dragRef.current.isDragging = false;
    dragRef.current.initialPinchDistance = null;
  };

  // --- Mouse Gestures (Drag Pan + Scroll Wheel to Zoom) ---
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current.isDragging = true;
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
    dragRef.current.initialPanX = panX;
    dragRef.current.initialPanY = panY;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current.isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPanX(dragRef.current.initialPanX + dx);
    setPanY(dragRef.current.initialPanY + dy);
  };

  const handleMouseUp = () => {
    dragRef.current.isDragging = false;
  };

  // Scroll wheel on picture zooms in/out smoothly
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom((prev) => Math.min(4.0, Math.max(0.4, prev + zoomDelta)));
  };

  const handleReset = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  const handleApplyCrop = () => {
    const finalUrl = generateCrop();
    if (finalUrl) {
      onCropComplete(finalUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-zinc-900 border-zinc-800 text-zinc-100'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-3.5 border-b ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-zinc-800 bg-zinc-950/70'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Adjust Your Profile Picture</h3>
              <p className="text-[11px] text-zinc-400">
                Pinch or scroll to zoom · Drag with finger to center inside circle
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Crop Work Area */}
        <div className="p-5 flex flex-col items-center space-y-4">
          {/* Interactive Crop Frame with Instagram-Style Circular Guide */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/40 bg-zinc-950 shadow-inner select-none cursor-grab active:cursor-grabbing flex items-center justify-center touch-none"
            style={{ width: `${CROP_SIZE}px`, height: `${CROP_SIZE}px` }}
          >
            {/* The Image - perfectly centered and scaled by user touch */}
            {naturalSize.width > 0 && (
              <img
                src={imageSrc}
                alt="Logo crop"
                draggable={false}
                className="absolute pointer-events-none select-none max-w-none"
                style={{
                  width: `${renderedWidth}px`,
                  height: `${renderedHeight}px`,
                  left: `${CROP_SIZE / 2 - renderedWidth / 2 + panX}px`,
                  top: `${CROP_SIZE / 2 - renderedHeight / 2 + panY}px`,
                }}
              />
            )}

            {/* Circular Mask Overlay (Darkens outside the circle, leaving the circular logo highlighted) */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div
                className="rounded-full border-2 border-emerald-400 shadow-sm"
                style={{
                  width: `${CROP_SIZE}px`,
                  height: `${CROP_SIZE}px`,
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.72)',
                }}
              />
            </div>

            {/* Crosshair guide lines */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
              <div className="w-full h-px border-t border-dashed border-white/60" />
              <div className="h-full w-px border-l border-dashed border-white/60 absolute" />
            </div>

            {/* Hint overlay */}
            <div className="pointer-events-none absolute bottom-2.5 bg-black/70 backdrop-blur-sm text-emerald-300 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5 shadow">
              <Move className="w-2.5 h-2.5" />
              <span>Use finger to drag & zoom on picture</span>
            </div>
          </div>

          {/* Quick Controls: Zoom buttons & Reset */}
          <div className="w-full max-w-sm flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.15).toFixed(2))))}
                className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors"
                title="Zoom Out"
              >
                − Zoom Out
              </button>
              <span className="text-xs font-mono font-bold text-emerald-400 w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(4.0, Number((z + 0.15).toFixed(2))))}
                className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors"
                title="Zoom In"
              >
                + Zoom In
              </button>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="text-[11px] text-zinc-400 hover:text-emerald-400 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-zinc-800"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Fit</span>
            </button>
          </div>

          {/* Live Website Header Preview */}
          <div className="w-full max-w-sm p-3 rounded-xl border border-zinc-800 bg-zinc-950/80 flex items-center justify-between gap-3">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                Live Result:
              </span>
              <p className="text-xs text-zinc-400 truncate">
                Preview of store logo & header badge
              </p>
            </div>

            <div className="flex items-center gap-2.5 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 shrink-0">
              {previewDataUrl ? (
                <div className="relative">
                  <img
                    src={previewDataUrl}
                    alt="Circular preview"
                    className="w-10 h-10 rounded-full aspect-square object-cover ring-2 ring-emerald-500 shadow-md"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-zinc-950" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-zinc-800 animate-pulse" />
              )}
              <div className="text-left">
                <div className="text-xs font-bold text-white leading-tight">Kainat Notes</div>
                <div className="text-[10px] text-emerald-400 font-mono font-semibold">Official Hub</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className={`flex items-center justify-end gap-2.5 px-5 py-3.5 border-t ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-zinc-800 bg-zinc-950/80'
          }`}
        >
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-zinc-700 hover:bg-zinc-800 text-zinc-300 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApplyCrop}
            className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-950/50 transition-colors active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Save & Apply Circular Logo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
