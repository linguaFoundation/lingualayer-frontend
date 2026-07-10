import { EmptyState } from '@/components/empty-state';
import { RoyaltiesEmptySvg } from '@/components/illustrations';

export const metadata = {
  title: 'Royalties | LinguaLayer',
  description:
    'Track your on-chain royalty payouts transparently. Start contributing to language datasets and earn your share.',
};

export default function RoyaltiesPage() {
  return (
    <div className="royalties-page">
      <header className="royalties-header">
        <span className="tag">Royalties</span>
        <h1>Royalty Dashboard</h1>
        <p className="royalties-subtitle">
          Every time a licensed dataset is used commercially, contributors earn a
          proportional royalty split — distributed transparently on-chain.
        </p>
      </header>

      {/*
        In production this section would render a payout timeline, cumulative
        earnings chart and per-dataset breakdown. For now we render the empty state
        since no payouts are registered yet.
      */}
      <EmptyState
        illustration={<RoyaltiesEmptySvg />}
        title="No royalties yet."
        description="Start contributing to language datasets and earn your share every time your data powers an AI product."
        ctaText="Browse Bounties"
        ctaHref="/bounties"
      />
    </div>
  );
}
