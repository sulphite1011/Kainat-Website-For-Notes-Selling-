import React, { useState, useEffect } from 'react';
import { NoteItem } from '../types';
import {
  X,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FileText,
  ExternalLink,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { formatGoogleDrivePreviewUrl, getDirectDriveViewUrl } from '../utils/driveUrlHelper';

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
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'text' | 'drive'>('drive');
  const [zoomLevel, setZoomLevel] = useState(100);

  const pages = (note.fullContentPages && note.fullContentPages.length > 0)
    ? note.fullContentPages
    : (note.previewPages && note.previewPages.length > 0)
    ? note.previewPages
    : [];

  const activePage = pages[activePageIndex] || null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && activePageIndex < pages.length - 1) {
        setActivePageIndex((prev) => prev + 1);
      } else if (e.key === 'ArrowLeft' && activePageIndex > 0) {
        setActivePageIndex((prev) => prev - 1);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePageIndex, pages.length, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950 text-white select-none">
      {/* Top Navbar */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-900/90 px-4 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h2 className="text-sm font-bold text-white truncate">{note.title}</h2>
            <div className="text-[11px] text-zinc-400 flex items-center gap-2">
              <span>{note.classLevel.replace('-', ' ')}</span>
              <span>·</span>
              <span className="text-emerald-400 font-mono">Licensed to: {studentData.email}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-xs">
            <button
              onClick={() => setViewMode('drive')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                viewMode === 'drive'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              PDF Document
            </button>
            {pages.length > 0 && (
              <button
                onClick={() => setViewMode('text')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  viewMode === 'text'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Paginated Reading
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Close Viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="relative flex-1 overflow-hidden bg-zinc-900/50 flex flex-col">
        {/* Dynamic Watermark Overlay */}
        <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-around opacity-5 select-none text-zinc-100 font-mono text-xs overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-around transform -rotate-12 whitespace-nowrap">
              <span>{studentData.name} ({studentData.email}) - Order #{studentData.orderId}</span>
              <span>{studentData.name} ({studentData.email}) - Order #{studentData.orderId}</span>
            </div>
          ))}
        </div>

        {/* View Mode: Drive PDF */}
        {viewMode === 'drive' && (
          <div className="relative w-full h-full flex flex-col">
            {note.googleDriveUrl || note.samplePdfUrl ? (
              <>
                <iframe
                  src={formatGoogleDrivePreviewUrl(note.googleDriveUrl || note.samplePdfUrl)}
                  title={note.title}
                  className="w-full flex-1 border-0 bg-zinc-950"
                  allow="autoplay"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                />
                <div className="px-4 py-2 bg-zinc-950 border-t border-zinc-800 text-xs text-zinc-400 flex items-center justify-between shrink-0">
                  <span className="truncate">If the PDF doesn't display due to browser cookie settings:</span>
                  <a
                    href={getDirectDriveViewUrl(note.googleDriveUrl || note.samplePdfUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 font-semibold hover:underline flex items-center gap-1 shrink-0 ml-2"
                  >
                    <span>Open PDF in Google Drive Tab</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <FileText className="w-12 h-12 text-zinc-600" />
                <h3 className="text-base font-bold text-white">Full Notes Unlocked</h3>
                <p className="text-xs text-zinc-400 max-w-md">
                  Your purchase is verified. Switch to the Paginated Reading tab above to view the complete study pages.
                </p>
              </div>
            )}
          </div>
        )}

        {/* View Mode: Text Pages */}
        {viewMode === 'text' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center">
            <div
              className="w-full max-w-3xl bg-zinc-950 rounded-2xl border border-zinc-800 p-6 sm:p-10 shadow-2xl space-y-6 transition-transform"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            >
              {activePage ? (
                <>
                  <div className="border-b border-zinc-800 pb-4">
                    <span className="text-xs text-emerald-400 font-semibold">{activePage.section}</span>
                    <h3 className="text-xl font-bold text-white mt-1">{activePage.title}</h3>
                  </div>

                  <div
                    className="prose prose-invert max-w-none text-zinc-300 text-xs sm:text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: activePage.contentHtml }}
                  />

                  {activePage.keyPoints && activePage.keyPoints.length > 0 && (
                    <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
                      <strong className="text-emerald-400 block font-semibold">Key Concepts:</strong>
                      <ul className="list-disc pl-4 space-y-1 text-zinc-300">
                        {activePage.keyPoints.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="border-t border-zinc-800 pt-4 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                    <span>Licensed Student: {studentData.email}</span>
                    <span>Order: #{studentData.orderId}</span>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-zinc-500">No content pages found.</div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer Controls for Text Mode */}
      {viewMode === 'text' && pages.length > 0 && (
        <footer className="h-12 border-t border-zinc-800 bg-zinc-950 px-4 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel((z) => Math.max(80, z - 10))}
              className="p-1 rounded text-zinc-400 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-zinc-500 font-mono text-[11px]">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
              className="p-1 rounded text-zinc-400 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActivePageIndex((p) => Math.max(0, p - 1))}
              disabled={activePageIndex === 0}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-zinc-300 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-zinc-400 text-xs">
              Page {activePageIndex + 1} of {pages.length}
            </span>
            <button
              onClick={() => setActivePageIndex((p) => Math.min(pages.length - 1, p + 1))}
              disabled={activePageIndex >= pages.length - 1}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-zinc-300 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};
