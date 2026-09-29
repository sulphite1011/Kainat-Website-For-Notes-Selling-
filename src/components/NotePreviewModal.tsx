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
  Check,
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
              <span>Free Demo Preview · {sampleLimit} Sample Pages</span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white truncate mt-0.5">{note.title}</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveTab('demo')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'demo'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Demo Preview</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('locked-info')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'locked-info'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Course Details</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="relative flex-1 overflow-hidden bg-zinc-950 flex flex-col">
          {activeTab === 'demo' && (
            <div className="relative flex-1 w-full h-full flex flex-col">
              <div className="px-4 py-2 bg-emerald-950/40 border-b border-emerald-900/40 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-200">
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    Viewing free sample pages. Full {totalPages}-page course unlocks upon purchase.
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
                  <div className="px-4 py-1.5 bg-zinc-950 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between shrink-0">
                    <span>If the PDF preview box appears blank:</span>
                    <a
                      href={directSampleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>Open directly in Google Drive</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3 max-w-md mx-auto">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Sample Preview Loading</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Sample preview pages for this chapter are loading. You can review the course topics or unlock the complete notes below.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'locked-info' && (
            <div className="p-6 overflow-y-auto max-w-3xl mx-auto space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">{note.title}</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">{note.description}</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Topics Included:
                </h4>
                <ul className="text-xs text-zinc-300 space-y-1.5 pl-4 list-disc marker:text-emerald-500">
                  {note.topicsCovered.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <span className="text-zinc-500 block text-[10px]">Class</span>
                  <span className="font-bold text-white">{note.classLevel.replace('-', ' ')}</span>
                </div>
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <span className="text-zinc-500 block text-[10px]">Subject</span>
                  <span className="font-bold text-white">{note.subject}</span>
                </div>
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <span className="text-zinc-500 block text-[10px]">Total Length</span>
                  <span className="font-bold text-white">{note.totalPages} pages</span>
                </div>
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <span className="text-zinc-500 block text-[10px]">Price</span>
                  <span className="font-bold text-emerald-400 font-mono">Rs. {note.pricePKR}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-zinc-950/95 border-t border-zinc-800 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[11px] text-zinc-500 block">Complete Course Price</span>
            <span className="text-base font-bold text-emerald-400 font-mono">
              Rs. {note.pricePKR}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onAddToCart(note)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer ${
                isInCart
                  ? 'bg-zinc-800 text-emerald-400 border border-emerald-600/50'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
              }`}
            >
              {isInCart ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>In Cart</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Add to Cart (Rs. {note.pricePKR})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
