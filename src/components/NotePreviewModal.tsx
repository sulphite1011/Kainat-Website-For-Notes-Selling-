import React, { useState } from 'react';
import { NoteItem } from '../types';
import { X, ChevronLeft, ChevronRight, ShoppingCart, Lock, ShieldCheck } from 'lucide-react';

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

  if (!note) return null;

  const previewPages = note.previewPages || [];
  const currentPage = previewPages[activePageIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/70">
          <div>
            <div className="text-xs text-emerald-400 font-semibold tracking-wide flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Free Sample Pages ({previewPages.length} of {note.totalPages} Available)</span>
            </div>
            <h2 className="text-base font-bold text-white line-clamp-1">{note.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="relative flex-1 overflow-y-auto p-6 bg-zinc-950/50">
          {/* Faint preview diagonal watermark */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none opacity-5">
            <div className="text-6xl font-black text-white rotate-[-30deg]">
              FREE PREVIEW SAMPLE
            </div>
          </div>

          {currentPage ? (
            <div className="relative z-10 max-w-2xl mx-auto space-y-6 bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-6 shadow-md select-none">
              {/* Page Header */}
              <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-400 font-mono">Page {currentPage.pageNumber}</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{currentPage.title}</h3>
                  <div className="text-xs text-zinc-400">{currentPage.section}</div>
                </div>
              </div>

              {/* Key Concept Points */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Key Examination Points:
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
              <div
                className="text-xs text-zinc-300 leading-relaxed border-t border-zinc-800 pt-3"
                dangerouslySetInnerHTML={{ __html: currentPage.contentHtml }}
              />

              {/* Teaser for remaining pages */}
              <div className="mt-6 p-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/80 text-center space-y-2">
                <Lock className="w-5 h-5 text-emerald-400 mx-auto" />
                <div className="text-xs font-semibold text-zinc-200">
                  {note.totalPages - previewPages.length} More Comprehensive Pages Locked
                </div>
                <p className="text-[11px] text-zinc-400">
                  Unlock complete derivations, numericals, and Google Drive source files with EasyPaisa checkout.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-400">No preview pages available.</div>
          )}
        </div>

        {/* Footer controls */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Pagination buttons */}
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

          {/* Add to Cart CTA */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="text-right hidden sm:block">
              <div className="text-[11px] text-zinc-400">Price</div>
              <div className="text-sm font-bold text-white font-mono">Rs. {note.pricePKR}</div>
            </div>
            <button
              onClick={() => {
                onAddToCart(note);
                onClose();
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{isInCart ? 'View in Cart' : `Unlock Full Notes (Rs. ${note.pricePKR})`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
