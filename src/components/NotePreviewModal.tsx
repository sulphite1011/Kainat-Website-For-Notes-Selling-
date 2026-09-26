import React, { useState } from 'react';
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
} from 'lucide-react';
import { formatGoogleDrivePreviewUrl, isDriveOrPdfUrl } from '../utils/driveUrlHelper';

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

  if (!note) return null;

  const previewPages = note.previewPages || [];
  const currentPage = previewPages[activePageIndex];
  const hasDrivePdf = isDriveOrPdfUrl(note.googleDriveUrl);
  const driveEmbedUrl = formatGoogleDrivePreviewUrl(note.googleDriveUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl flex flex-col h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-zinc-800 bg-zinc-950/80 shrink-0">
          <div className="min-w-0 pr-3">
            <div className="text-xs text-emerald-400 font-semibold tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Free Student Sample ({previewPages.length} of {note.totalPages} Pages Previewable)</span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white truncate mt-0.5">{note.title}</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle: Interactive Notes Sample vs PDF Drive Preview */}
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
                <span>Sample Notes</span>
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
                <span>PDF Document Preview</span>
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
                      <span className="text-xs text-emerald-400 font-mono">Page {currentPage.pageNumber}</span>
                      <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">{currentPage.title}</h3>
                      <div className="text-xs text-zinc-400 mt-0.5">{currentPage.section}</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      Sample
                    </span>
                  </div>

                  {/* Core Notes Key Takeaways */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-emerald-300 uppercase tracking-wide">
                      Key Highlights & Definitions:
                    </div>
                    <ul className="space-y-1.5 text-xs text-zinc-200">
                      {currentPage.keyPoints?.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold shrink-0">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

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
                  <div className="mt-6 p-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/80 text-center space-y-2">
                    <Lock className="w-5 h-5 text-emerald-400 mx-auto" />
                    <div className="text-xs font-semibold text-zinc-200">
                      {Math.max(1, note.totalPages - previewPages.length)} More Comprehensive Pages Locked
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Unlock complete derivations, numericals, and full Google Drive source files with EasyPaisa checkout.
                    </p>
                  </div>
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
                    Switch to Google Drive PDF Preview
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Google Drive PDF Preview */}
          {activeTab === 'pdf' && (
            <div className="relative flex-1 w-full h-full flex flex-col bg-zinc-950">
              {/* Notification bar */}
              <div className="px-4 py-2 bg-zinc-900/90 border-b border-zinc-800 text-[11px] flex items-center justify-between text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Google Drive / PDF Reader Sample View</span>
                </span>
                {hasDrivePdf && (
                  <a
                    href={note.googleDriveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                  >
                    <span>Open in Drive</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {hasDrivePdf && driveEmbedUrl ? (
                <div className="relative flex-1 w-full h-full">
                  <iframe
                    src={driveEmbedUrl}
                    title={note.title}
                    className="w-full h-full border-0"
                    allow="autoplay"
                    sandbox="allow-scripts allow-same-origin allow-popups"
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">Google Drive PDF Preview Ready</h3>
                    <p className="text-xs text-zinc-400 max-w-md">
                      This note is delivered digitally via secure reader and Google Drive. When Kainat uploads a Google Drive file link, the live document embeds here.
                    </p>
                  </div>
                </div>
              )}
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
                Page {activePageIndex + 1} of {previewPages.length}
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
              Full {note.totalPages}-page curriculum verified by Kainat
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
