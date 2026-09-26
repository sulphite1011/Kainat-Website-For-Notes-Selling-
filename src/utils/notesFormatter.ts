import { NotePage } from '../types';

/**
 * Parses raw text pasted by Kainat (curriculum, syllabus, lecture notes, textbook excerpts)
 * and turns them into formatted digital note pages with highlights, formulas, and board questions.
 */
export function generatePagesFromRawContent(
  rawText: string,
  title: string,
  chapterTitle: string,
  classLevel: string,
  topics: string[]
): NotePage[] {
  const clean = (rawText || '').trim();

  // If no text was pasted, generate a standard formatted starter page
  if (!clean) {
    const defaultPage: NotePage = {
      pageNumber: 1,
      title: `${chapterTitle || title} - Unit Overview & Core Concepts`,
      section: 'Section 1.1 - Definition & Board Derivations',
      keyPoints:
        topics.length > 0
          ? topics
          : [
              'Comprehensive handwritten summary and conceptual definitions.',
              'Board repeated questions solved step by step.',
              'Key terminology, laws, and examination notes.',
            ],
      formulas: [
        `\\text{Unit: } ${chapterTitle || title}`,
        `\\text{Level: } ${classLevel || 'General'}`,
      ],
      boardQuestions: [
        `Important 5-mark derivation from ${chapterTitle || 'this unit'}`,
        'Define key principles and state real-world applications.',
      ],
      contentHtml: `
        <div class="space-y-3">
          <p class="text-sm font-semibold text-white"><strong>${title}</strong></p>
          <p class="text-xs text-zinc-300">Curated by Kainat. Includes detailed formulas, derivations, and board examination solutions for ${classLevel}.</p>
          <div class="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-emerald-300">
            ✓ Complete topper notes crafted according to FBISE & Punjab Board syllabus guidelines.
          </div>
        </div>
      `,
    };
    return [defaultPage];
  }

  // Split by double newline or page breaks
  const rawSections = clean
    .split(/\n\s*---\s*\n|\n\s*===\s*\n|\n{3,}/)
    .map((s) => s.trim())
    .filter(Boolean);

  const sectionsToUse = rawSections.length > 0 ? rawSections : [clean];

  return sectionsToUse.map((sec, index) => {
    const lines = sec.split('\n').map((l) => l.trim()).filter(Boolean);
    const pageNum = index + 1;

    // Detect first heading or use default
    const firstLine = lines[0] || '';
    const isHeading = firstLine.length < 90 && !firstLine.endsWith('.');
    const pageTitle = isHeading
      ? firstLine.replace(/^[#*0-9.\s-]+/, '')
      : `${chapterTitle || title} (Part ${pageNum})`;

    // Filter key bullets and formulas
    const bullets: string[] = [];
    const formulas: string[] = [];
    const questions: string[] = [];
    const paragraphs: string[] = [];

    const bodyLines = isHeading ? lines.slice(1) : lines;

    bodyLines.forEach((line) => {
      if (line.startsWith('•') || line.startsWith('- ') || line.startsWith('* ')) {
        bullets.push(line.replace(/^[•\-*]\s*/, ''));
      } else if (line.includes('=') && (line.includes('\\') || line.includes('^') || line.includes('Δ') || line.length < 50)) {
        formulas.push(line);
      } else if (line.endsWith('?') || line.toLowerCase().includes('q:') || line.toLowerCase().includes('question')) {
        questions.push(line);
      } else {
        paragraphs.push(line);
      }
    });

    // Provide sensible defaults if empty
    if (bullets.length === 0) {
      if (topics.length > 0) {
        bullets.push(...topics.slice(0, 4));
      } else {
        bullets.push(
          'Detailed definitions, diagram concepts, and examiner expectations.',
          'Formulas, units, and conversion factors highlighted for exams.'
        );
      }
    }

    if (questions.length === 0) {
      questions.push(
        `Explain the core mechanism of ${pageTitle} (Frequent 4-Mark Board Question).`
      );
    }

    // Build structured HTML
    const formattedParagraphsHtml = paragraphs
      .map((p) => `<p class="text-xs leading-relaxed text-zinc-300 mb-2">${p}</p>`)
      .join('');

    const contentHtml = `
      <div class="space-y-4 font-sans">
        <div class="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800">
          <div class="text-xs font-bold text-emerald-400 mb-1">Unit Focus: ${pageTitle}</div>
          <div class="text-xs text-zinc-300 leading-relaxed">
            ${paragraphs.length > 0 ? formattedParagraphsHtml : `<p>${sec.replace(/\n/g, '<br/>')}</p>`}
          </div>
        </div>
      </div>
    `;

    return {
      pageNumber: pageNum,
      title: pageTitle,
      section: `Section ${pageNum}.1 - ${chapterTitle || 'Core Concepts'}`,
      keyPoints: bullets.slice(0, 6),
      formulas: formulas.length > 0 ? formulas.slice(0, 4) : undefined,
      boardQuestions: questions.slice(0, 3),
      contentHtml,
    };
  });
}
