"use client";

import React, { useState, useEffect, useRef } from "react";

interface MasonryLayoutProps {
  children: React.ReactNode;
  columnCount: number;
}

export const MasonryLayout: React.FC<MasonryLayoutProps> = ({ children, columnCount }) => {
  const [columns, setColumns] = useState<Array<Array<{ child: React.ReactNode; index: number }>>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const layoutMasonry = () => {
      if (!containerRef.current) return;

      // Initialize column arrays
      const cols: Array<Array<{ child: React.ReactNode; index: number }>> = Array.from(
        { length: columnCount },
        () => []
      );
      const colHeights = Array(columnCount).fill(0);

      // Distribute items to shortest column
      React.Children.forEach(children, (child, index) => {
        if (!itemRefs.current[index]) return;

        const height = itemRefs.current[index]?.offsetHeight || 0;
        const shortestCol = colHeights.indexOf(Math.min(...colHeights));

        cols[shortestCol].push({ child, index });
        colHeights[shortestCol] += height;
      });

      setColumns(cols);
    };

    // Layout after render
    const timeoutId = setTimeout(layoutMasonry, 0);

    // Re-layout on window resize
    const handleResize = () => {
      layoutMasonry();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, [children, columnCount]);

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden items for measuring (off-screen, not interactive, do not affect scroll) */}
      <div className="fixed -top-[10000px] left-0 opacity-0 pointer-events-none" aria-hidden="true">
        {React.Children.map(children, (child, index) => (
          <div
            key={index}
            ref={(el) => { itemRefs.current[index] = el; }}
            style={{ width: `${100 / columnCount}%` }}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Visible columns */}
      <div className="flex gap-6 items-start">
        {columns.map((col, colIndex) => (
          <div key={colIndex} className="flex-1 flex flex-col gap-6">
            {col.map(({ child, index }) => (
              <div key={index}>{child}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};