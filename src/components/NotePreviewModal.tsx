import React, { useState } from 'react';
import { NoteItem } from '../types';
import {
  X,
  ShoppingCart,
  Lock,
  ShieldCheck,
  FileText,
  ExternalLink,
  BookOpen,
  Sparkles,
  CheckCircle2,
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
  const [activeTab, setActiveTab] = useState<'demo' | 'locked-info'>('demo');

  if (!note) return null;

  // Prefer demo sample PDF link; fallback to googleDriveUrl if not separately set
  const samplePdfLink = (note.samplePdfUrl && note.samplePdfUrl.trim()) || note.googleDriveUrl || '';
  const hasSamplePdf = isDriveOrPdfUrl(samplePdfLink);
  const sampleEmbedUrl = formatGoogleDrivePreviewUrl(samplePdfLink);
  const directSampleUrl = getDirectDriveViewUrl(samplePdfLink);

  const sampleLimit = note.previewPageLimit || 3;
  const totalPages = note.totalPages || 24;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl flex flex-col h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-zinc-800 bg-zinc-950/90 shrink-0">
          <div className="min-w-0 pr-3">
            <div className="text-xs text-emerald-400 font-semibold tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Free Demo Notes Sample ({sampleLimit} Pages Free Preview)</span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white truncate mt-0.5">{note.title}</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch between Demo Sample Reader & Locked Complete Course Info */}
            <div className="flex items-center bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveTab('demo')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  activeTab === 'demo'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Demo Sample PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('locked-info')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  activeTab === 'locked-info'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Full Notes (Locked)</span>
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

        {/* Content Body */}
        <div className="relative flex-1 overflow-hidden bg-zinc-950 flex flex-col">
          {/* TAB 1: DEMO SAMPLE PDF VIEWER */}
          {activeTab === 'demo' && (
            <div className="relative flex-1 w-full h-full flex flex-col">
              {/* Notice Bar */}
              <div className="px-4 py-2 bg-emerald-950/40 border-b border-emerald-900/40 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-200">
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    Viewing free sample pages ({sampleLimit} demo pages). Complete {totalPages}-page course unlocks upon purchase.
                  </span>
                </span>

                {hasSamplePdf && directSampleUrl && (
                  <a
                    href={directSampleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold hover:underline ml-auto"
                  >
                    <span>Open in Fullscreen Tab</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {hasSamplePdf && sampleEmbedUrl ? (
                <div className="relative flex-1 w-full h-full flex flex-col bg-zinc-900">
                  <iframe
                    src={sampleEmbedUrl}
                    title={`${note.title} - Sample PDF`}
                    className="w-full flex-1 border-0 bg-zinc-900"
                    allow="autoplay"
                    sandbox="allow-scripts allow-same-origin allow-popups"
                  />

                  {/* Fallback bar if third party cookies are blocked by browser */}
                  <div className="px-4 py-1.5 bg-zinc-950 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between shrink-0">
                    <span>If the PDF preview box appears blank (Google cookie restriction):</span>
                    <a
                      href={directSampleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>Click here to launch direct Google Drive sample viewer</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white">Demo Sample PDF Ready</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Mam Kainat has prepared authentic demo sample pages for this course. Add your Google Drive sample PDF link in the Admin portal to preview directly inside this window.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LOCKED COMPLETE PDF SECTION */}
          {activeTab === 'locked-info' && (
            <div className="relative flex-1 w-full h-full overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
              <div className="max-w-xl w-full space-y-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-950/40">
                  <Lock className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-800/80 text-[11px] font-bold text-amber-300">
                    <span>Full Notes PDF Strictly Locked</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{note.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    The complete course contains all <strong>{totalPages} comprehensive pages</strong> with step-by-step board derivations, solved past papers, formula sheets, and numerical exam keys.
                  </p>
                </div>

                {/* Topics Covered Box */}
                {note.topicsCovered && note.topicsCovered.length > 0 && (
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-left space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                      What Unlocks in the Complete Course:
                    </div>
                    <ul className="text-xs text-zinc-300 space-y-1.5">
                      {note.topicsCovered.map((topic, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('demo')}
                    className="w-full sm:flex-1 py-2.5 px-4 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Back to Demo Sample</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onAddToCart(note);
                      onClose();
                    }}
                    className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-1.5"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Unlock Complete Course (Rs. {note.pricePKR})</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="px-4 sm:px-6 py-3.5 border-t border-zinc-800 bg-zinc-950/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="font-mono text-emerald-400 font-semibold">{totalPages} Total Pages</span>
            <span>·</span>
            <span>Academic Level: {note.classLevel.replace('-', ' ')}</span>
            <span>·</span>
            <span>Subject: {note.subject}</span>
          </div>

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
