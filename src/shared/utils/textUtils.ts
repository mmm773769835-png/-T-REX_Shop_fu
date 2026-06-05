/**
 * Normalizes text for search comparison.
 * Handles both Arabic and Latin text with appropriate normalization.
 */
export const normalizeText = (text: string): string => {
  if (!text) return "";
  const str = String(text);
  const trimmed = str.trim();
  const hasArabic = /[\u0600-\u06FF]/.test(trimmed);

  if (hasArabic) {
    return trimmed
      .normalize("NFC")
      .replace(/[\u064B-\u065F\u0670]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  } else {
    return trimmed
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  }
};
