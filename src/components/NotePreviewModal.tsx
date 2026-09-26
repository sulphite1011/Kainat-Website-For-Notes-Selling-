import React, { useState, useEffect } from 'react';
import { NoteItem } from '../types';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Lock,
  ShieldCheck,
  FileText,
  ExternalLink,
  BookOpen,
  ShieldAlert,
} from 'lucide-react';
import { formatGoogleDrivePreviewUrl, isDriveOrPdfUrl, getDirectDriveViewUrl } from '../utils/driveUrlHelper';

interface NotePreviewModalProps {
  note: NoteItem | null;
  onClose: () => void;
  onAddToCart: (note: NoteItem) => void;
  isInCart: boolean;
}

export const NotePreviewModal: React.FC<NotePreviewModalProps> = ({
  note,
  onClose,
  onAddToCart,
  isInCart,
}) => {
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'sample' | 'pdf'>('sample');

  // Reset tab to 'sample' whenever note changes so pasted online notes always show first
  useEffect(() => {
    if (note) {
      setActivePageIndex(0);
      const hasSamplePages = (note.previewPages && note.previewPages.length > 0) || (note.fullContentPages && note.fullContentPages.length > 0);
      setActiveTab(hasSamplePages ? 'sample' : 'pdf');
    }
  }, [note]);

  if (!note) return null;

  // Use fullContentPages length if available, otherwise totalPages or previewPages
  const totalAvailablePages = Math.max(
    note.totalPages || 0,
    note.fullContentPages?.length || 0,
    note.previewPages?.length || 0,
    1
  );

  const previewPages = (note.previewPages && note.previewPages.length > 0)
    ? note.previewPages
    : (note.fullContentPages && note.fullContentPages.length > 0)
    ? note.fullContentPages.slice(0, note.previewPageLimit || 3)
    : [];

  const currentPage = previewPages[activePageIndex];
  const hasDrivePdf = isDriveOrPdfUrl(note.googleDriveUrl);
  const driveEmbedUrl = formatGoogleDrivePreviewUrl(note.googleDriveUrl);
  const directDriveUrl = getDirectDriveViewUrl(note.googleDriveUrl);
  const freeLimit = note.previewPageLimit || 3;

  // Exact remaining locked count
  const remainingLockedCount = Math.max(0, totalAvailablePages - previewPages.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl flex flex-col h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-zinc-800 bg-zinc-950/80 shrink-0">
          <div className="min-w-0 pr-3">
            <div className="text-xs text-emerald-400 font-semibold tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>
                Free Student Sample ({previewPages.length} of {totalAvailablePages} Pages Previewable)
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white truncate mt-0.5">{note.title}</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle: Interactive Notes Sample vs PDF Document */}
            <div className="flex items-center bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveTab('sample')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'sample'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>Sample Notes ({previewPages.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('pdf')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'pdf'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3 h-3" />
                <span>PDF Document</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors shrink-0"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative flex-1 overflow-hidden bg-zinc-950/50 flex flex-col">
          {/* TAB 1: Digital Interactive Sample */}
          {activeTab === 'sample' && (
            <div className="relative flex-1 overflow-y-auto p-4 sm:p-6">
              {/* Faint preview diagonal watermark */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none opacity-5">
                <div className="text-6xl font-black text-white rotate-[-30deg]">
                  FREE PREVIEW SAMPLE
                </div>
              </div>

              {currentPage ? (
                <div className="relative z-10 max-w-2xl mx-auto space-y-6 bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-5 sm:p-6 shadow-md select-none">
                  {/* Page Header */}
                  <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-emerald-400 font-mono">
                        Sample Page {currentPage.pageNumber || activePageIndex + 1} of {previewPages.length} (Free {freeLimit}-Page Limit)
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">{currentPage.title}</h3>
                      <div className="text-xs text-zinc-400 mt-0.5">{currentPage.section}</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      Sample Page
                    </span>
                  </div>

                  {/* Core Notes Key Takeaways */}
                  {currentPage.keyPoints && currentPage.keyPoints.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-emerald-300 uppercase tracking-wide">
                        Key Highlights & Definitions:
                      </div>
                      <ul className="space-y-1.5 text-xs text-zinc-200">
                        {currentPage.keyPoints.map((pt, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-400 font-bold shrink-0">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Formulas if present */}
                  {currentPage.formulas && currentPage.formulas.length > 0 && (
                    <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
                      <div className="text-[11px] font-semibold text-teal-400 uppercase tracking-wide">
                        Governing Formulas:
                      </div>
                      <div className="text-xs font-mono text-zinc-200 space-y-1">
                        {currentPage.formulas.map((f, i) => (
                          <div key={i} className="bg-zinc-900/80 px-2 py-1 rounded border border-zinc-800/60">
                            {f}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Solved Board Questions */}
                  {currentPage.boardQuestions && currentPage.boardQuestions.length > 0 && (
                    <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/40 space-y-1">
                      <div className="text-[11px] font-semibold text-amber-300 uppercase tracking-wide">
                        Board Exam Highlighted Questions:
                      </div>
                      <ul className="text-xs text-amber-100/90 space-y-1">
                        {currentPage.boardQuestions.map((q, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-400 font-bold">★</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Rendered HTML excerpt */}
                  {currentPage.contentHtml && (
                    <div
                      className="text-xs text-zinc-300 leading-relaxed border-t border-zinc-800 pt-3"
                      dangerouslySetInnerHTML={{ __html: currentPage.contentHtml }}
                    />
                  )}

                  {/* Teaser for remaining pages */}
                  {remainingLockedCount > 0 ? (
                    <div className="mt-6 p-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/80 text-center space-y-2">
                      <Lock className="w-5 h-5 text-emerald-400 mx-auto" />
                      <div className="text-xs font-semibold text-zinc-200">
                        {remainingLockedCount} More Comprehensive Pages Locked
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        To protect Kainat's proprietary notes, complete derivations, numericals, and full PDF access unlock exclusively upon verified payment.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6 p-3.5 rounded-xl border border-emerald-800/40 bg-emerald-950/20 text-center space-y-1">
                      <ShieldCheck className="w-5 h-5 text-emerald-400 mx-auto" />
                      <div className="text-xs font-semibold text-emerald-300">
                        All {totalAvailablePages} Pages Available Upon Verification
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Instant unlock inside the interactive reader once verified with EasyPaisa.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-zinc-400 space-y-2">
                  <FileText className="w-10 h-10 mx-auto text-zinc-600" />
                  <p className="text-xs">Digital page excerpts are being formatted.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('pdf')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
                  >
                    Switch to PDF Document Tab
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Protected PDF Notice & Secure Vault (Guards Google Drive from Free Downloading) */}
          {activeTab === 'pdf' && (
            <div className="relative flex-1 w-full h-full flex flex-col bg-zinc-950">
              <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 text-center max-w-lg mx-auto space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-950/20">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 p-1 bg-red-600 rounded-full text-white">
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-800/80 text-[11px] font-bold text-amber-300">
                    <span>PDF Protected from Unauthorized Download</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Full PDF & Google Drive Access Restricted
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    To prevent illegal document downloading and sharing, complete Google Drive files are locked until purchase. 
                    You can read the first <strong>{freeLimit} sample pages</strong> under the <strong>"Sample Notes"</strong> tab.
                  </p>
                </div>

                <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 text-left space-y-2">
                  <div className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wide">
                    What unlocks after EasyPaisa verification:
                  </div>
                  <ul className="text-xs text-zinc-400 space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>Full {totalAvailablePages}-page complete course syllabus</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>High-resolution Google Drive PDF streaming</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>Protected reader with dynamic watermark security</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('sample')}
                    className="w-full sm:flex-1 px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-emerald-400 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Read Free Sample Pages ({previewPages.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onAddToCart(note);
                      onClose();
                    }}
                    className="w-full sm:flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-1.5"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Unlock Full PDF (Rs. {note.pricePKR})</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="px-4 sm:px-6 py-3.5 border-t border-zinc-800 bg-zinc-950/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Pagination buttons for sample mode */}
          {activeTab === 'sample' && previewPages.length > 0 ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActivePageIndex((prev) => Math.max(0, prev - 1))}
                disabled={activePageIndex === 0}
                className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-zinc-400 font-mono">
                Sample Page {activePageIndex + 1} of {previewPages.length} (Limit: {freeLimit})
              </span>
              <button
                onClick={() => setActivePageIndex((prev) => Math.min(previewPages.length - 1, prev + 1))}
                disabled={activePageIndex >= previewPages.length - 1}
                className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-xs text-zinc-400">
              Total {totalAvailablePages} Pages · Curated by Kainat
            </div>
          )}

          {/* Add to Cart CTA */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Course Price</div>
              <div className="text-base font-bold text-emerald-400 font-mono">Rs. {note.pricePKR}</div>
            </div>

            <button
              onClick={() => {
                onAddToCart(note);
                onClose();
              }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all ${
                isInCart
                  ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{isInCart ? 'View In Cart' : `Unlock Full Notes (Rs. ${note.pricePKR})`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
