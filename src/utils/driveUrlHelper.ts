/**
 * Google Drive URL formatting utilities for embedded preview & direct viewing
 */

export function extractGoogleDriveFileId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Format 1: /file/d/ID/...
  const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch && fileMatch[1]) return fileMatch[1];

  // Format 2: open?id=ID or uc?id=ID or id=ID
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) return idMatch[1];

  // Format 3: /document/d/ID
  const docMatch = trimmed.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
  if (docMatch && docMatch[1]) return docMatch[1];

  // Format 4: /presentation/d/ID
  const presMatch = trimmed.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
  if (presMatch && presMatch[1]) return presMatch[1];

  // Format 5: /spreadsheets/d/ID
  const sheetMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (sheetMatch && sheetMatch[1]) return sheetMatch[1];

  // Format 6: /folders/ID
  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch && folderMatch[1]) return folderMatch[1];

  return null;
}

export function formatGoogleDrivePreviewUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();

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

  // If already a preview URL
  if (trimmed.includes('drive.google.com') && trimmed.endsWith('/preview')) {
    return trimmed;
  }

  // Standard web PDF file link
  if (trimmed.toLowerCase().endsWith('.pdf') || trimmed.toLowerCase().includes('.pdf?')) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(trimmed)}&embedded=true`;
  }

  // Cloudflare R2 / S3 / Direct web URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return trimmed;
}

export function getDirectDriveViewUrl(url: string): string {
  if (!url) return '';
  const fileId = extractGoogleDriveFileId(url);
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
  }
  return url;
}

export function isDriveOrPdfUrl(url?: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase().trim();
  return (
    lower.includes('drive.google.com') ||
    lower.includes('docs.google.com') ||
    lower.includes('.pdf') ||
    Boolean(extractGoogleDriveFileId(url)) ||
    lower.startsWith('http://') ||
    lower.startsWith('https://')
  );
}
