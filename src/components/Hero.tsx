import React from 'react';
import { ShieldCheck, Smartphone, CheckCircle2, Award } from 'lucide-react';

interface HeroProps {
  onSelectCategory: (cat: string) => void;
  onOpenTrack: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onSelectCategory, onOpenTrack }) => {
  return (
    <section className="relative overflow-hidden border-b border-zinc-800/60 bg-gradient-to-b from-zinc-900/60 via-zinc-950 to-zinc-950 py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text Block */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>2026 Board & University Syllabus Updated</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 text-teal-300">
                <Award className="w-3.5 h-3.5" />
                <span>Curated by Kainat</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white text-balance leading-tight">
              Master Source Notes for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-300">
                Matric, FSc & BSc
              </span>{' '}
              Students
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 max-w-2xl leading-relaxed">
              Topper-curated derivations, solved past papers, formula sheets, and chapter summaries. Quick EasyPaisa checkout, fast WhatsApp activation, and instant multi-device digital reading.
            </p>

            {/* Quick Segmented Selectors */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={() => onSelectCategory('Matric-9th')}
                className="px-3.5 py-1.5 text-xs font-semibold text-zinc-200 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/50 rounded-lg transition-colors cursor-pointer"
              >
                Matric 9th
              </button>
              <button
                onClick={() => onSelectCategory('Matric-10th')}
                className="px-3.5 py-1.5 text-xs font-semibold text-zinc-200 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/50 rounded-lg transition-colors cursor-pointer"
              >
                Matric 10th
              </button>
              <button
                onClick={() => onSelectCategory('FSc-Part1')}
                className="px-3.5 py-1.5 text-xs font-semibold text-zinc-200 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/50 rounded-lg transition-colors cursor-pointer"
              >
                FSc Part-1 (11th)
              </button>
              <button
                onClick={() => onSelectCategory('FSc-Part2')}
                className="px-3.5 py-1.5 text-xs font-semibold text-zinc-200 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/50 rounded-lg transition-colors cursor-pointer"
              >
                FSc Part-2 (12th)
              </button>
              <button
                onClick={() => onSelectCategory('BSc-Year1')}
                className="px-3.5 py-1.5 text-xs font-semibold text-zinc-200 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/50 rounded-lg transition-colors cursor-pointer"
              >
                BSc Higher Sciences
              </button>
              <button
                onClick={onOpenTrack}
                className="px-3.5 py-1.5 text-xs font-semibold text-emerald-300 hover:text-emerald-200 bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-800/40 rounded-lg transition-colors cursor-pointer"
              >
                Track My Order
              </button>
            </div>

            {/* Adjacent Trust Proof Strip */}
            <div className="pt-4 border-t border-zinc-800/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>EasyPaisa: <strong className="text-zinc-200">03415892099</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>WhatsApp: <strong className="text-zinc-200">0324 9059918</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Secure Digital Reader</span>
              </div>
            </div>
          </div>

          {/* Right Image Showcase */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl group">
              <img
                src="/images/hero_notes_showcase_1790249177382.jpg"
                alt="Comprehensive scientific source notes by Kainat"
                className="w-full h-80 lg:h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.parentElement?.querySelector('.img-hero-fallback');
                  if (fallback) (fallback as HTMLElement).style.display = 'flex';
                }}
              />
              <div className="img-hero-fallback hidden w-full h-80 lg:h-96 items-center justify-center bg-zinc-900 text-zinc-400 flex-col gap-3">
                <ShieldCheck className="w-12 h-12 text-emerald-400" />
                <span className="text-sm font-semibold">Curated Examination Vault</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 p-3 bg-zinc-900/90 backdrop-blur-md rounded-xl border border-zinc-700/60 flex items-center justify-between text-xs">
                <div>
                  <span className="text-white font-bold block">100% Board Syllabus Solved</span>
                  <span className="text-zinc-400 text-[11px]">Handwritten Derivations & Diagrams</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 text-[11px]">
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
