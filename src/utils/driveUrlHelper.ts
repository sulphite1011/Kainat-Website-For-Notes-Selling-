// Converts Google Drive share links into embeddable /preview or direct /view URLs
export function formatGoogleDrivePreviewUrl(url: string | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Already a preview link
  if (trimmed.includes('/preview')) return trimmed;

  // Extract ID from standard drive URLs: /file/d/<id>/view or ?id=<id>
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return `https://drive.google.com/file/d/${fileDMatch[1]}/preview`;
  }

  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    return `https://drive.google.com/file/d/${idParamMatch[1]}/preview`;
  }

  // Direct PDF or standard URL fallback
  return trimmed;
}

export function getDirectDriveViewUrl(url: string | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return `https://drive.google.com/file/d/${fileDMatch[1]}/view?usp=sharing`;
  }
  return trimmed;
}

export function isDriveOrPdfUrl(url: string | undefined): boolean {
  if (!url) return false;
  const lower = url.toLowerCase().trim();
  return (
    lower.includes('drive.google.com') ||
    lower.includes('docs.google.com') ||
    lower.endsWith('.pdf') ||
    lower.includes('.pdf?')
  );
}
