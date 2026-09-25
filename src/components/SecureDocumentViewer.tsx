import React, { useState, useEffect, useRef } from 'react';
import { NoteItem, NotePage } from '../types';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Shield, 
  ShieldAlert, 
  Maximize2, 
  Minimize2, 
  Sun,
  Moon,
  Lock
} from 'lucide-react';

interface SecureDocumentViewerProps {
  note: NoteItem;
  studentData: {
    name: string;
    email: string;
    phone: string;
    orderId: string;
  };
  onClose: () => void;
}

export const SecureDocumentViewer: React.FC<SecureDocumentViewerProps> = ({
  note,
  studentData,
  onClose,
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [viewMode, setViewMode] = useState<'reader' | 'drive'>('reader');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);
  const [screenshotAttempted, setScreenshotAttempted] = useState(false);
  const [themeMode, setThemeMode] = useState<'dark' | 'contrast'>('dark');

  const containerRef = useRef<HTMLDivElement>(null);

  // Combine preview & full content pages safely
  const allPages: NotePage[] = (note.fullContentPages && note.fullContentPages.length > 0 
    ? note.fullContentPages 
    : note.previewPages) || [];
  const activePage = allPages[currentPageIndex] || allPages[0];

  // 1. Anti-Screenshot & Screen Capture Detection via Window Blur & Visibility
  useEffect(() => {
    const handleBlur = () => {
      setIsWindowBlurred(true);
    };

    const handleFocus = () => {
      setIsWindowBlurred(false);
      setScreenshotAttempted(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsWindowBlurred(true);
      } else {
        setIsWindowBlurred(false);
      }
    };

    // Keyboard interception: PrintScreen, Ctrl+P, Ctrl+S, DevTools
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen / PrtScn key
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault();
        setScreenshotAttempted(true);
        setIsWindowBlurred(true);
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText('PROTECTED CONTENT - KAINAT NOTES HUB');
          }
        } catch {
          // ignore
        }
        return;
      }

      // Block Ctrl+P (Print)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        setScreenshotAttempted(true);
        return;
      }

      // Block Ctrl+S (Save)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        return;
      }

      // Block Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        return;
      }

      // Block F12 and devtools shortcuts
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c' || e.key === 'J' || e.key === 'j'))
      ) {
        e.preventDefault();
        return;
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const watermarkString = `KAINAT NOTES · LICENSED EXCLUSIVELY TO: ${studentData.name.toUpperCase()} (${studentData.email}) · WA: ${studentData.phone} · ORDER #${studentData.orderId} · UNAUTHORIZED SHARING PROHIBITED`;

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      className={`fixed inset-0 z-50 flex flex-col bg-zinc-950 text-zinc-100 select-none ${
        themeMode === 'contrast' ? 'bg-black' : 'bg-zinc-950'
      }`}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* Top Security Banner & Controls */}
      <header className="flex items-center justify-between px-4 sm:px-6 h-14 border-b border-zinc-800 bg-zinc-900/90 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/60">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kainat Protected Reader</span>
          </div>

          <div className="hidden sm:block text-xs text-zinc-300 font-medium truncate max-w-md">
            {note.title}
          </div>
        </div>

        {/* Center Mode Switcher */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
          <button
            onClick={() => setViewMode('reader')}
            className={`px-3 py-1 rounded-md transition-colors font-medium ${
              viewMode === 'reader'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Digital Paginated Notes
          </button>
          <button
            onClick={() => setViewMode('drive')}
            className={`px-3 py-1 rounded-md transition-colors font-medium ${
              viewMode === 'drive'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Google Drive Protected PDF
          </button>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2">
          {viewMode === 'reader' && (
            <>
              <div className="flex items-center gap-1 border-r border-zinc-800 pr-2">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(75, z - 15))}
                  className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono text-zinc-400 w-10 text-center">
                  {zoomLevel}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
                  className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setThemeMode((m) => (m === 'dark' ? 'contrast' : 'dark'))}
                className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800"
                title="Toggle Contrast Mode"
              >
                {themeMode === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
              </button>
            </>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 ml-1"
            title="Close Viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Document Reading Area */}
      <div className="relative flex-1 overflow-hidden bg-zinc-950 flex flex-col items-center justify-center">
        {/* Anti-Screen-Capture Obfuscation Blanket */}
        {(isWindowBlurred || screenshotAttempted) && (
          <div className="absolute inset-0 z-40 bg-zinc-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="p-3 bg-red-950/80 border border-red-800 rounded-full text-red-400">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Security Shield Activated</h3>
            <p className="text-xs text-zinc-400 max-w-md">
              Window focus lost or screen capture shortcut detected. To protect Kainat's intellectual property, content is obscured until the viewer is directly refocused.
            </p>
            <button
              onClick={() => {
                setIsWindowBlurred(false);
                setScreenshotAttempted(false);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
            >
              Resume Reading
            </button>
          </div>
        )}

        {/* Dynamic Multi-Angled Watermark Grid Overlay - strictly tied to paying student */}
        <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden flex flex-col justify-around opacity-15 select-none">
          {[0, 1, 2, 3, 4, 5].map((rowIdx) => (
            <div
              key={rowIdx}
              className="whitespace-nowrap font-mono text-[11px] sm:text-xs font-bold text-emerald-300 transform -rotate-12 translate-y-2 translate-x-4 animate-watermark-float"
            >
              {watermarkString} &nbsp; • &nbsp; {watermarkString}
            </div>
          ))}
        </div>

        {/* View Mode 1: Integrated Paginated Digital Note Reader */}
        {viewMode === 'reader' && (
          <div className="w-full h-full overflow-y-auto p-4 sm:p-8 flex justify-center">
            <div
              className={`w-full max-w-3xl rounded-xl border border-zinc-800 p-6 sm:p-10 shadow-2xl space-y-6 transition-all duration-200 ${
                themeMode === 'contrast' ? 'bg-black text-white border-zinc-700' : 'bg-zinc-900/90 text-zinc-100'
              }`}
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
              }}
            >
              {/* Note Page Header */}
              <div className="border-b border-zinc-800 pb-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-emerald-400 font-mono">
                    Page {activePage.pageNumber} of {allPages.length}
                  </div>
                  <h2 className="text-xl font-bold mt-1 text-white">{activePage.title}</h2>
                  <div className="text-xs text-zinc-400 mt-0.5">{activePage.section}</div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Class Level</div>
                  <div className="text-xs font-semibold text-zinc-300">{note.classLevel}</div>
                  <div className="text-xs text-emerald-400">{note.subject}</div>
                </div>
              </div>

              {/* Key Concept Points */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Key Examination Points:
                </div>
                <ul className="space-y-1.5 text-xs text-zinc-200">
                  {activePage.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold shrink-0">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Governing Formulas */}
              {activePage.formulas && activePage.formulas.length > 0 && (
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="text-[11px] font-semibold text-teal-400 uppercase tracking-wide">
                    Governing Equations & Formulas:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-zinc-200">
                    {activePage.formulas.map((form, i) => (
                      <div key={i} className="bg-zinc-900/80 px-3 py-2 rounded-lg border border-zinc-800">
                        {form}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Solved Board Exam Questions */}
              {activePage.boardQuestions && activePage.boardQuestions.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/50 space-y-2">
                  <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wide">
                    Past Board Exam Frequent Questions:
                  </div>
                  <ul className="text-xs text-amber-100/90 space-y-1.5">
                    {activePage.boardQuestions.map((q, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">★</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Comprehensive Formatted Content Excerpt */}
              <div
                className="text-xs leading-relaxed border-t border-zinc-800 pt-4 text-zinc-300 space-y-3"
                dangerouslySetInnerHTML={{ __html: activePage.contentHtml }}
              />

              {/* Page Footer Watermark Indicator */}
              <div className="border-t border-zinc-800 pt-4 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <span>Paying Student: {studentData.email}</span>
                <span>Verified Order: #{studentData.orderId}</span>
              </div>
            </div>
          </div>
        )}

        {/* View Mode 2: Google Drive PDF Protected Viewport */}
        {viewMode === 'drive' && (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-2 sm:p-4">
            <div className="relative w-full max-w-5xl h-full rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl">
              {/* Shield overlay intercepting pop-out & download clicks on the Google Drive preview */}
              <div className="absolute top-0 right-0 w-32 h-16 z-20 cursor-not-allowed bg-transparent" />

              <iframe
                src={note.googleDriveUrl}
                title={note.title}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Toolbar for Paginated Reader */}
      {viewMode === 'reader' && (
        <footer className="h-14 border-t border-zinc-800 bg-zinc-900/90 flex items-center justify-between px-4 sm:px-8 z-20">
          <div className="text-xs text-zinc-400 font-mono">
            Page <span className="text-white font-bold">{currentPageIndex + 1}</span> of{' '}
            <span className="text-white font-bold">{allPages.length}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPageIndex((p) => Math.max(0, p - 1))}
              disabled={currentPageIndex === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Page</span>
            </button>

            <button
              onClick={() => setCurrentPageIndex((p) => Math.min(allPages.length - 1, p + 1))}
              disabled={currentPageIndex >= allPages.length - 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next Page</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[11px] text-zinc-500 hidden sm:block">
            Protected Copy · Screen Captures Blocked
          </div>
        </footer>
      )}
    </div>
  );
};
