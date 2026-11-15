import type { CSSProperties, ElementType, ReactNode } from 'react';

interface RevealTitleProps {
  text: string;
  as?: ElementType;
  id?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * Section title whose letters rise in one by one when it scrolls into view
 * (same motion as the hero name). Letters are grouped per word so lines break between words.
 */
export default function RevealTitle({ text, as: Tag = 'h2', id, className = '' }: RevealTitleProps) {
  const words = text.split(' ');
  const offsets = words.map((_, w) => words.slice(0, w).reduce((sum, word) => sum + word.length + 1, 0));

  return (
    <Tag id={id} aria-label={text} data-reveal className={`reveal-title ${className}`}>
      <span aria-hidden="true">
        {words.map((word, w) => (
          <span key={w}>
            {w > 0 && ' '}
            <span className="inline-block whitespace-nowrap">
              {word.split('').map((char, c) => (
                <span key={c} className="title-char" style={{ '--i': offsets[w] + c } as CSSProperties}>
                  {char}
                </span>
              ))}
            </span>
          </span>
        ))}
      </span>
    </Tag>
  );
}
