import type { CSSProperties } from 'react';

type LetterpressProps = {
  text: string;
  delay?: number;
  className?: string;
};

/**
 * Character-level print reveal for selected editorial headlines.
 * The accessible label remains a single phrase; visual glyphs are hidden
 * from assistive technology to avoid character-by-character announcements.
 */
export default function Letterpress({ text, delay = 0, className = '' }: LetterpressProps) {
  return (
    <span className={`letterpress ${className}`.trim()} role="text" aria-label={text}>
      <span className="letterpress-visual" aria-hidden="true">
        {Array.from(text).map((character, index) => (
          <span
            className={character === ' ' ? 'letterpress-char is-space' : 'letterpress-char'}
            key={`${index}-${character}`}
            style={{
              '--letter-index': index,
              '--letter-delay': `${delay}ms`,
            } as CSSProperties}
          >
            {character === ' ' ? ' ' : character}
          </span>
        ))}
      </span>
    </span>
  );
}
