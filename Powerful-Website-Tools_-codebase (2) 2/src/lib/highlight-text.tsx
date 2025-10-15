import React from 'react';

/**
 * Highlight matched search terms in text
 * @param text - The text to highlight
 * @param query - The search query to highlight
 * @returns React elements with highlighted matches
 */
export function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim() || !text) {
    return text;
  }

  // Escape special regex characters in the query
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Create regex to match query (case-insensitive)
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  
  // Split text by matches
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, index) => {
        // Check if this part matches the query
        const isMatch = regex.test(part);
        regex.lastIndex = 0; // Reset regex
        
        return isMatch ? (
          <mark 
            key={index} 
            className="bg-primary/20 text-foreground font-medium px-0.5 rounded"
          >
            {part}
          </mark>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        );
      })}
    </>
  );
}

/**
 * Component wrapper for highlighted text
 */
export function HighlightedText({ 
  text, 
  query 
}: { 
  text: string; 
  query: string;
}) {
  return <>{highlightText(text, query)}</>;
}