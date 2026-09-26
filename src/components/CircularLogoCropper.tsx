import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, Check, RotateCcw, Move, Sparkles } from 'lucide-react';

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
  const [zoom, setZoom] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');

  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const CROP_SIZE = 280; // Size of the crop frame in pixels

  // Generate cropped preview
  const generateCrop = useCallback(() => {
    if (!imgRef.current) return '';
    const img = imgRef.current;
    const canvas = document.createElement('canvas');
    const OUTPUT_SIZE = 400; // High-res output
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Clear
    ctx.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    // Create circular clip path
    ctx.beginPath();
    ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Calculate drawing dimensions
    const scaleFactor = OUTPUT_SIZE / CROP_SIZE;
    const baseWidth = img.naturalWidth || img.width;
    const baseHeight = img.naturalHeight || img.height;
    
    // Fit aspect ratio
    const baseScale = Math.max(CROP_SIZE / baseWidth, CROP_SIZE / baseHeight);
    const drawWidth = baseWidth * baseScale * zoom * scaleFactor;
    const drawHeight = baseHeight * baseScale * zoom * scaleFactor;

    const centerX = OUTPUT_SIZE / 2 + panX * scaleFactor;
    const centerY = OUTPUT_SIZE / 2 + panY * scaleFactor;

    const drawX = centerX - drawWidth / 2;
    const drawY = centerY - drawHeight / 2;

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

    return canvas.toDataURL('image/png');
  }, [zoom, panX, panY]);

  // Update preview on adjustments
  useEffect(() => {
    const timer = setTimeout(() => {
      const dataUrl = generateCrop();
      setPreviewDataUrl(dataUrl);
    }, 50);
    return () => clearTimeout(timer);
  }, [generateCrop]);

  // Mouse / Touch Drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - panX, y: e.touches[0].clientY - panY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPanX(e.touches[0].clientX - dragStart.x);
    setPanY(e.touches[0].clientY - dragStart.y);
  };

  const handleApplyCrop = () => {
    const finalUrl = generateCrop();
    if (finalUrl) {
      onCropComplete(finalUrl);
    }
  };

  const handleReset = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-zinc-900 border-zinc-800 text-zinc-100'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-zinc-800 bg-zinc-950/70'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Instagram-Style Circular Logo Cropper</h3>
              <p className="text-[11px] text-zinc-400">
                Adjust zoom and drag to position. The glowing circle is exactly what will appear on your website.
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
        <div className="p-6 flex flex-col items-center space-y-6">
          {/* Interactive Crop Frame with Instagram-Style Circular Mask */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            className="relative overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 shadow-inner select-none cursor-move flex items-center justify-center"
            style={{ width: `${CROP_SIZE}px`, height: `${CROP_SIZE}px` }}
          >
            {/* The Image being transformed */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop target"
              draggable={false}
              className="absolute max-w-none transition-transform pointer-events-none"
              style={{
                transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                transformOrigin: 'center center',
              }}
            />

            {/* Circular Cutout Mask (Darkens the corners, leaves circle clear) */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              {/* Overlay with 50% opacity outside circle using box-shadow */}
              <div
                className="w-full h-full rounded-full border-2 border-emerald-400 border-dashed"
                style={{
                  boxShadow: '0 0 0 9999px rgba(9, 9, 11, 0.78)',
                }}
              />
            </div>

            {/* Hint overlay */}
            <div className="pointer-events-none absolute bottom-2 bg-black/60 backdrop-blur-sm text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
              <Move className="w-2.5 h-2.5" />
              <span>Drag to Pan</span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="w-full max-w-md space-y-4">
            {/* Zoom Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-zinc-300 font-medium">
                <span className="flex items-center gap-1.5">
                  <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Zoom / Scale: {Math.round(zoom * 100)}%</span>
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[11px] text-zinc-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <ZoomOut className="w-4 h-4 text-zinc-500" />
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
                <ZoomIn className="w-4 h-4 text-emerald-400" />
              </div>
            </div>

            {/* Fine Tuning Horizontal & Vertical Sliders */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                  <span>Pan X:</span>
                  <span>{panX}px</span>
                </div>
                <input
                  type="range"
                  min="-150"
                  max="150"
                  step="1"
                  value={panX}
                  onChange={(e) => setPanX(parseInt(e.target.value, 10))}
                  className="w-full accent-teal-500 h-1 bg-zinc-800 rounded cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                  <span>Pan Y:</span>
                  <span>{panY}px</span>
                </div>
                <input
                  type="range"
                  min="-150"
                  max="150"
                  step="1"
                  value={panY}
                  onChange={(e) => setPanY(parseInt(e.target.value, 10))}
                  className="w-full accent-teal-500 h-1 bg-zinc-800 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Live Website Header Preview */}
            <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/80 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                  Live Instagram-Style Preview:
                </span>
                <p className="text-xs text-zinc-400">
                  How it appears in your website header & admin portal
                </p>
              </div>

              <div className="flex items-center gap-3 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                {previewDataUrl ? (
                  <div className="relative">
                    <img
                      src={previewDataUrl}
                      alt="Circular preview"
                      className="w-10 h-10 rounded-full aspect-square object-cover ring-2 ring-emerald-500 ring-offset-2 ring-offset-zinc-950 shadow-md"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-950" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-zinc-800 animate-pulse" />
                )}
                <div>
                  <div className="text-xs font-bold text-white leading-tight">Kainat Notes</div>
                  <div className="text-[10px] text-emerald-400 font-mono font-semibold">Official Store</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className={`flex items-center justify-end gap-3 px-6 py-4 border-t ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-zinc-800 bg-zinc-950/80'
          }`}
        >
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-700 hover:bg-zinc-800 text-zinc-300 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApplyCrop}
            className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Save & Apply Circular Logo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
