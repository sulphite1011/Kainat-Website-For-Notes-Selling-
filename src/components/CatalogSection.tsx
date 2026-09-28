import React, { useState, useMemo } from 'react';
import { NoteItem, ClassLevel, SubjectName } from '../types';
import { BookOpen, Search, Eye, ShoppingCart, Check, Star, ShieldAlert, Sparkles, Clock, MessageCircle, FileText } from 'lucide-react';

interface CatalogSectionProps {
  notes: NoteItem[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onPreviewNote: (note: NoteItem) => void;
  onAddToCart: (note: NoteItem) => void;
  onOpenViewer: (noteId: string) => void;
  cartNoteIds: string[];
  unlockedNoteIds: string[];
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  notes,
  selectedCategory,
  setSelectedCategory,
  onPreviewNote,
  onAddToCart,
  onOpenViewer,
  cartNoteIds,
  unlockedNoteIds,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dynamically compute all classes present in catalog
  const classFilters = useMemo(() => {
    const defaults = [
      { label: 'All Classes', value: 'All' },
      { label: 'Matric 9th', value: 'Matric-9th' },
      { label: 'Matric 10th', value: 'Matric-10th' },
      { label: 'FSc Part-1 (11th)', value: 'FSc-Part1' },
      { label: 'FSc Part-2 (12th)', value: 'FSc-Part2' },
      { label: 'BSc Higher Sciences', value: 'BSc-Year1' },
    ];
    const existingValues = new Set(defaults.map((d) => d.value));
    const extraClasses: Array<{ label: string; value: string }> = [];

    notes.forEach((n) => {
      if (n.classLevel && !existingValues.has(n.classLevel)) {
        existingValues.add(n.classLevel);
        extraClasses.push({ label: n.classLevel, value: n.classLevel });
      }
    });

    return [...defaults, ...extraClasses];
  }, [notes]);

  const subjectFilters = useMemo(() => {
    const set = new Set(['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology']);
    notes.forEach((n) => {
      if (n.subject) set.add(n.subject);
    });
    return Array.from(set);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter((item) => {
      // Class filter
      if (selectedCategory !== 'All') {
        if (selectedCategory === 'BSc-Year1') {
          if (item.classLevel !== 'BSc-Year1' && item.classLevel !== 'BSc-Year2') return false;
        } else if (item.classLevel !== selectedCategory) {
          return false;
        }
      }

      // Subject filter
      if (selectedSubject !== 'All' && item.subject !== selectedSubject) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesChapter = item.chapterTitle.toLowerCase().includes(q);
        const matchesTopic = item.topicsCovered.some((t) => t.toLowerCase().includes(q));
        const matchesSubject = item.subject.toLowerCase().includes(q);
        if (!matchesTitle && !matchesChapter && !matchesTopic && !matchesSubject) return false;
      }

      return true;
    });
  }, [notes, selectedCategory, selectedSubject, searchQuery]);

  return (
    <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Course Notes & Solved Papers</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Select your academic level and download-free protected reader will unlock upon EasyPaisa verification.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search derivations, chapters, topics..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Class Level Segmented Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-zinc-800/80">
          {classFilters.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedCategory(tab.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === tab.value
                  ? 'bg-zinc-800 text-emerald-400 border border-zinc-700 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Subject Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mr-1">Subject:</span>
          {subjectFilters.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap ${
                selectedSubject === sub
                  ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/40 border border-zinc-800/40'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {filteredNotes.length === 0 ? (
        selectedCategory !== 'All' && !notes.some((n) => n.classLevel === selectedCategory || (selectedCategory === 'BSc-Year1' && (n.classLevel === 'BSc-Year1' || n.classLevel === 'BSc-Year2'))) ? (
          <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 via-zinc-900/50 to-zinc-950 p-8 sm:p-12 text-center shadow-xl">
            {/* Ambient emerald backlight */}
            <div className="absolute top-0 left-1/2 -translate-y-1/2 w-96 h-32 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

            <div className="relative z-10 max-w-lg mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Class Syllabus in Production</span>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-emerald-400 mx-auto shadow-inner">
                <Clock className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {selectedCategory.replace('-', ' ')} Courses Coming Soon! 🚀
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Mam Kainat is currently handwriting and preparing comprehensive chapter derivations, board solved past papers, formula sheets, and numerical exam keys for <strong>{selectedCategory.replace('-', ' ')}</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-left text-xs text-zinc-300 space-y-2">
                <div className="font-semibold text-emerald-400 uppercase tracking-wide text-[11px]">
                  What's being prepared for {selectedCategory.replace('-', ' ')}:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400">✓</span>
                    <span>All Board Solved Derivations</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400">✓</span>
                    <span>10-Year Solved Past Papers</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400">✓</span>
                    <span>Formulas & Short Questions</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400">✓</span>
                    <span>MCQ Objective Keys</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`https://wa.me/923249059918?text=${encodeURIComponent(`Hello Mam Kainat! I am waiting for ${selectedCategory.replace('-', ' ')} notes. Please let me know when they are available or if I can pre-order!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Notify Me on WhatsApp</span>
                </a>

                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedSubject('All');
                    setSearchQuery('');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors"
                >
                  Browse Available Classes (9th, FSc)
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
            <BookOpen className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-zinc-300">No notes found for this filter criteria</p>
            <p className="text-xs text-zinc-500 mt-1">Try resetting the class or subject filter</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedSubject('All');
                setSearchQuery('');
              }}
              className="mt-4 px-3 py-1.5 text-xs text-emerald-400 hover:text-emerald-300 bg-zinc-800 rounded-lg"
            >
              Reset Filters
            </button>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => {
            const isUnlocked = unlockedNoteIds.includes(note.id);
            const isInCart = cartNoteIds.includes(note.id);

            return (
              <div
                key={note.id}
                className="group relative flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 hover:border-zinc-700 transition-all duration-200 overflow-hidden"
              >
                <div>
                  {/* Card Cover Banner */}
                  <div className="relative h-44 w-full bg-zinc-950 overflow-hidden border-b border-zinc-800/80">
                    {note.coverImage ? (
                      <img
                        src={note.coverImage}
                        alt={note.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.parentElement?.querySelector('.img-fallback');
                          if (fallback) (fallback as HTMLElement).style.display = 'flex';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : null}
                    <div
                      className={`img-fallback w-full h-full items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950 text-zinc-600 ${
                        note.coverImage ? 'hidden' : 'flex'
                      }`}
                    >
                      <BookOpen className="w-12 h-12 text-emerald-500/40" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

                    {/* Unlocked / Bundle Indicator */}
                    {isUnlocked ? (
                      <div className="absolute top-3 left-3 bg-emerald-900/90 text-emerald-200 border border-emerald-700 text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Unlocked in Library</span>
                      </div>
                    ) : note.isBundle ? (
                      <div className="absolute top-3 left-3 bg-amber-950/90 text-amber-200 border border-amber-800 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                        Master Bundle (Discounted)
                      </div>
                    ) : null}

                    {/* Class & Subject Watermark Tag */}
                    <div className="absolute bottom-2 left-3 text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
                      <span>{note.classLevel.replace('-', ' ')}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-zinc-300 font-semibold">{note.subject}</span>
                    </div>

                    <div className="absolute bottom-2 right-3 text-[11px] text-zinc-400 font-mono">
                      {note.totalPages} pages
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-base font-bold text-white leading-snug line-clamp-2 group-hover:text-emerald-300 transition-colors">
                      {note.title}
                    </h3>

                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {note.description}
                    </p>

                    {/* Topics Covered Preview */}
                    <div className="space-y-1 pt-1">
                      <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                        Key Topics Included:
                      </div>
                      <ul className="text-xs text-zinc-300 space-y-1">
                        {note.topicsCovered.slice(0, 3).map((topic, i) => (
                          <li key={i} className="flex items-start gap-1.5 line-clamp-1">
                            <span className="text-emerald-500 font-bold shrink-0">›</span>
                            <span className="truncate">{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-5 pt-0 mt-4 border-t border-zinc-800/80 space-y-3">
                  <div className="flex items-baseline justify-between pt-3">
                    <div>
                      <div className="text-[11px] text-zinc-500">Student Price</div>
                      <div className="text-lg font-bold text-white font-mono tabular-nums">
                        Rs. {note.pricePKR}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-amber-400 font-medium font-mono">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{note.rating}</span>
                      <span className="text-zinc-500">({note.reviewsCount})</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onPreviewNote(note)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-950/70 rounded-lg border border-emerald-800/50 transition-colors"
                      title="Read 3-4 free demo pages from Google Drive"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Demo Notes (PDF)</span>
                    </button>

                    {isUnlocked ? (
                      <button
                        onClick={() => onOpenViewer(note.id)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Read Now</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onAddToCart(note)}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors shadow-sm ${
                          isInCart
                            ? 'bg-zinc-800 text-emerald-400 border border-emerald-600/50'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
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
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
