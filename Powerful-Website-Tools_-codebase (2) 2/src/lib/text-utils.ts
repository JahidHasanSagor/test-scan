/**
 * Truncates text to a maximum number of words
 * @param text - The text to truncate
 * @param maxWords - Maximum number of words (default: 150)
 * @returns Truncated text with ellipsis if needed
 */
export function truncateWords(text: string, maxWords: number = 150): string {
  if (!text) return '';
  
  const words = text.trim().split(/\s+/);
  
  if (words.length <= maxWords) {
    return text;
  }
  
  return words.slice(0, maxWords).join(' ') + '...';
}

/**
 * Counts the number of words in a text
 * @param text - The text to count words in
 * @returns Number of words
 */
export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}