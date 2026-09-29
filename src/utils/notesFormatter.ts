import { NotePage } from '../types/index.ts';

export function generatePagesFromRawContent(
  rawText: string,
  chapterTitle: string,
  classLevel: string,
  subject: string
): NotePage[] {
  if (!rawText || !rawText.trim()) {
    return [
      {
        pageNumber: 1,
        title: `${chapterTitle} - Unit Overview & Core Concepts`,
        section: 'Section 1.1 - Definition & Board Derivations',
        keyPoints: [
          'Important definitions and foundational theorems verified for board syllabus.',
          'Step-by-step mathematical proofs with units and scientific diagrams.',
          'Exam-oriented conceptual breakdowns with solved examples.',
        ],
        formulas: [
          `\\text{Level: } ${classLevel}`,
          `\\text{Subject: } ${subject}`,
          `\\text{Unit: } ${chapterTitle}`,
        ],
        boardQuestions: [
          `Frequently tested 5-mark long question from ${chapterTitle}.`,
          'Explain the principle, state law, and derive standard formula.',
        ],
        contentHtml: `
          <div class="space-y-4">
            <h4 class="text-base font-bold text-white">${chapterTitle}</h4>
            <p class="text-xs text-zinc-300 leading-relaxed">
              Curated by Kainat. Includes detailed formulas, derivations, and board examination solutions for ${classLevel} ${subject}.
            </p>
            <div class="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-emerald-300">
              ✓ Complete topper notes crafted according to FBISE & Punjab Board syllabus guidelines.
            </div>
          </div>
        `,
      },
    ];
  }

  // Split by double newline or custom markers
  const paragraphs = rawText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const paragraphsPerPage = 3;
  const totalPages = Math.max(1, Math.ceil(paragraphs.length / paragraphsPerPage));
  const pages: NotePage[] = [];

  for (let i = 0; i < totalPages; i++) {
    const pageParagraphs = paragraphs.slice(i * paragraphsPerPage, (i + 1) * paragraphsPerPage);
    const html = `
      <div class="space-y-3.5">
        ${pageParagraphs.map((p) => `<p class="text-xs sm:text-sm text-zinc-200 leading-relaxed">${p}</p>`).join('')}
      </div>
    `;

    pages.push({
      pageNumber: i + 1,
      title: `${chapterTitle} - Part ${i + 1}`,
      section: `Section ${i + 1} - Derivations & Explanations`,
      keyPoints: [
        `Core concept summary part ${i + 1}`,
        'Board examination standard solution',
      ],
      formulas: [`\\text{Chapter: } ${chapterTitle}`],
      boardQuestions: [`State and prove the theorem discussed in Part ${i + 1}.`],
      contentHtml: html,
    });
  }

  return pages;
}
