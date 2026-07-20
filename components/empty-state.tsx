import Link from 'next/link';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  /** The SVG illustration to display */
  illustration: ReactNode;
  /** Short, punchy headline */
  title: string;
  /** Longer descriptive text beneath the title */
  description: string;
  /** Button label */
  ctaText: string;
  /** Where the CTA navigates to */
  ctaHref: string;
  /** Optional extra class on the root wrapper */
  className?: string;
}

/**
 * EmptyState
 *
 * Consistent, accessible empty state used across all data-empty pages.
 * Renders an SVG illustration, a title, a description, and a CTA button.
 * All interactive elements have unique IDs for testing.
 */
export function EmptyState({
  illustration,
  title,
  description,
  ctaText,
  ctaHref,
  className,
}: EmptyStateProps) {
  return (
    <div className={`empty-state${className ? ` ${className}` : ''}`} role="status" aria-live="polite">
      <div className="empty-state__illustration" aria-hidden="true">
        {illustration}
      </div>
      <h2 className="empty-state__title">{title}</h2>
      <p className="empty-state__description">{description}</p>
      <Link
        href={ctaHref}
        className="empty-state__cta cta"
        id={`empty-cta-${title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
      >
        {ctaText}
      </Link>
    </div>
  );
}
