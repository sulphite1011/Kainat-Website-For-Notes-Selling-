import React, { useState, useRef, useEffect } from 'react';
import { X, Check, RotateCw, RefreshCw, Hand } from 'lucide-react';

interface CircularLogoCropperProps {
  imageSrc: string;
  onCropComplete: (croppedBase64: string) => void;
  onCancel: () => void;
}

const VIEWPORT_SIZE = 256; // Viewport circle size in pixels
const OUTPUT_SIZE = 384;   // High-res output icon size in pixels

export const CircularLogoCropper: React.FC<CircularLogoCropperProps> = ({
  imageSrc,
  onCropComplete,
  onCancel,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number; baseScale: number } | null>(null);

  // Mouse drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Touch gesture state (pinch to zoom & drag)
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartZoomRef = useRef<number>(1);
  const touchStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartPointRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const imgRef = useRef<HTMLImageElement | null>(null);

  // Load natural dimensions to calculate base fit
  useEffect(() => {
    const img = new window.Image();
    img.src = imageSrc;
    img.onload = () => {
      const natW = img.naturalWidth || 256;
      const natH = img.naturalHeight || 256;
      // Fit completely within 220px so full picture is visible without any pre-zoom
      const fitTarget = 220;
      const baseScale = Math.min(fitTarget / natW, fitTarget / natH);
      setImgDimensions({ width: natW, height: natH, baseScale });
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setRotation(0);
    };
  }, [imageSrc]);

  // --- Mouse Handlers ---
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // --- Wheel Zoom Handler ---
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((prev) => Math.min(4.0, Math.max(0.25, prev * zoomFactor)));
  };

  // --- Touch Gesture Handlers (1-finger drag, 2-finger pinch) ---
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartPointRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      touchStartPosRef.current = { ...position };
      touchStartDistRef.current = null;
    } else if (e.touches.length === 2) {
      const dist = getTouchDistance(e.touches);
      touchStartDistRef.current = dist;
      touchStartZoomRef.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && touchStartDistRef.current === null) {
      const dx = e.touches[0].clientX - touchStartPointRef.current.x;
      const dy = e.touches[0].clientY - touchStartPointRef.current.y;
      setPosition({
        x: touchStartPosRef.current.x + dx,
        y: touchStartPosRef.current.y + dy,
      });
    } else if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      const dist = getTouchDistance(e.touches);
      if (touchStartDistRef.current > 0) {
        const scale = dist / touchStartDistRef.current;
        const newZoom = touchStartZoomRef.current * scale;
        setZoom(Math.min(4.0, Math.max(0.25, newZoom)));
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      touchStartDistRef.current = null;
    } else if (e.touches.length === 1) {
      touchStartPointRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      touchStartPosRef.current = { ...position };
      touchStartDistRef.current = null;
    }
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  // --- Exact 1-to-1 Mathematical Crop ---
  const handleCrop = () => {
    if (!imgRef.current || !imgDimensions) return;
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clean circular clip
    ctx.beginPath();
    ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Map screen container coordinates (VIEWPORT_SIZE = 256) to canvas (OUTPUT_SIZE = 384)
    const ratio = OUTPUT_SIZE / VIEWPORT_SIZE;

    ctx.save();
    // 1. Move to canvas center
    ctx.translate(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2);
    // 2. Rotate
    ctx.rotate((rotation * Math.PI) / 180);
    // 3. Translate by dragged position (scaled to canvas)
    ctx.translate(position.x * ratio, position.y * ratio);
    // 4. Scale by zoom and baseScale
    const totalScale = zoom * ratio * imgDimensions.baseScale;
    ctx.scale(totalScale, totalScale);

    // 5. Draw image centered
    const natW = imgDimensions.width;
    const natH = imgDimensions.height;
    ctx.drawImage(imgRef.current, -natW / 2, -natH / 2, natW, natH);
    ctx.restore();

    const cropped = canvas.toDataURL('image/png');
    onCropComplete(cropped);
  };

  const renderedW = imgDimensions ? imgDimensions.width * imgDimensions.baseScale : 200;
  const renderedH = imgDimensions ? imgDimensions.height * imgDimensions.baseScale : 200;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white">Adjust Circular Logo</h3>
            <p className="text-[11px] text-zinc-400">Touch pinch to zoom · Drag to position</p>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewport Circle: 256x256 */}
        <div className="relative flex items-center justify-center py-2">
          <div
            className="relative w-64 h-64 rounded-full overflow-hidden border-2 border-emerald-500 shadow-2xl shadow-emerald-950/50 bg-zinc-900 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none ring-4 ring-emerald-500/20"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Logo Adjust"
              draggable={false}
              className="pointer-events-none max-w-none transition-transform duration-75"
              style={{
                width: `${renderedW}px`,
                height: `${renderedH}px`,
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
              }}
            />

            {/* Circular Guide overlay */}
            <div className="absolute inset-0 pointer-events-none rounded-full border border-dashed border-white/20" />
          </div>
        </div>

        {/* Gesture Guidance & Quick Controls */}
        <div className="flex items-center justify-between px-2 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Hand className="w-3.5 h-3.5 text-emerald-400" />
            <span>Scale: {Math.round(zoom * 100)}%</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-800 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
              title="Rotate 90°"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Rotate</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-800 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
              title="Fit to circle"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Fit</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs rounded-xl border border-zinc-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCrop}
            className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Apply Logo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
