/**
 * Google Drive URL formatting utilities for embedded preview & direct viewing
 */

export function extractGoogleDriveFileId(url: string): string | null {
  if (!url) return null;
  
  // Format 1: /file/d/ID/...
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch && fileMatch[1]) return fileMatch[1];

  // Format 2: open?id=ID or uc?id=ID
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) return idMatch[1];

  // Format 3: /document/d/ID
  const docMatch = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
  if (docMatch && docMatch[1]) return docMatch[1];

  // Format 4: /presentation/d/ID
  const presMatch = url.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
  if (presMatch && presMatch[1]) return presMatch[1];

  // Format 5: /spreadsheets/d/ID
  const sheetMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (sheetMatch && sheetMatch[1]) return sheetMatch[1];

  return null;
}

export function formatGoogleDrivePreviewUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // If already preview
  if (trimmed.includes('drive.google.com') && trimmed.endsWith('/preview')) {
    return trimmed;
  }

  const fileId = extractGoogleDriveFileId(trimmed);
  if (fileId) {
    if (trimmed.includes('docs.google.com/document')) {
      return `https://docs.google.com/document/d/${fileId}/preview`;
    }
    if (trimmed.includes('docs.google.com/presentation')) {
      return `https://docs.google.com/presentation/d/${fileId}/preview`;
    }
    if (trimmed.includes('docs.google.com/spreadsheets')) {
      return `https://docs.google.com/spreadsheets/d/${fileId}/preview`;
    }
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  // If it's a PDF web link
  if (trimmed.toLowerCase().endsWith('.pdf') || trimmed.toLowerCase().includes('.pdf?')) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(trimmed)}&embedded=true`;
  }

  return trimmed;
}

export function getDirectDriveViewUrl(url: string): string {
  if (!url) return '';
  const fileId = extractGoogleDriveFileId(url);
  if (fileId && url.includes('drive.google.com')) {
    return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
  }
  return url;
}

export function isDriveOrPdfUrl(url?: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes('drive.google.com') ||
    lower.includes('docs.google.com') ||
    lower.endsWith('.pdf') ||
    Boolean(extractGoogleDriveFileId(url))
  );
}
