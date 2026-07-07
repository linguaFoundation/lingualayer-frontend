'use client';
import type { FC } from 'react';

export type QualityTier = 'Unrated' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

interface QualityBadgeProps {
  tier: QualityTier;
  score?: number;
  compact?: boolean;
}

const TIER_META: Record<QualityTier, { label: string; color: string; emoji: string }> = {
  Unrated:  { label: 'Unrated',  color: '#6b7280', emoji: '○' },
  Bronze:   { label: 'Bronze',   color: '#cd7f32', emoji: '◆' },
  Silver:   { label: 'Silver',   color: '#9ca3af', emoji: '◆' },
  Gold:     { label: 'Gold',     color: '#f59e0b', emoji: '◆' },
  Platinum: { label: 'Platinum', color: '#8b5cf6', emoji: '★' },
};

export const QualityBadge: FC<QualityBadgeProps> = ({ tier, score, compact }) => {
  const meta = TIER_META[tier] ?? TIER_META.Unrated;
  return (
    <span
      className={compact ? 'quality-badge quality-badge--compact' : 'quality-badge'}
      style={{ '--tier-color': meta.color } as React.CSSProperties}
      title={score !== undefined ? `Quality score: ${score}/100` : meta.label}
      aria-label={`Quality tier: ${meta.label}${score !== undefined ? `, score ${score}` : ''}`}
    >
      <span aria-hidden>{meta.emoji}</span>
      {!compact && <span>{meta.label}</span>}
      {!compact && score !== undefined && <span className="quality-score">{score}</span>}
    </span>
  );
};
