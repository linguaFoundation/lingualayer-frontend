import { EmptyState } from '@/components/empty-state';
import { ContributorEmptySvg } from '@/components/illustrations';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ address: string }>;
}

/**
 * Generates dynamic <title> and Open Graph metadata per contributor address.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { address } = await params;
  const truncated = `${address.slice(0, 6)}…${address.slice(-4)}`;
  return {
    title: `Contributor ${truncated} | LinguaLayer`,
    description: `Explore datasets and royalties registered on-chain by contributor ${address} on LinguaLayer.`,
  };
}

/**
 * /contributors/[address] — Contributor profile page.
 *
 * In production this page would fetch contributor stats (datasets registered,
 * total earnings, active bounties) from the API. For now it renders the empty
 * state since the contributor has no activity yet.
 */
export default async function ContributorPage({ params }: PageProps) {
  const { address } = await params;

  // Derive a friendly short label and an avatar initial from the wallet address.
  const truncated = `${address.slice(0, 6)}…${address.slice(-4)}`;
  const avatarInitial = address.slice(2, 4).toUpperCase();

  // In production: const activity = await fetchContributorActivity(address);
  const activity: unknown[] = [];

  return (
    <div className="contributor-page">
      <header className="contributor-header">
        <div
          className="contributor-avatar"
          aria-hidden="true"
          title={`Avatar for ${truncated}`}
        >
          {avatarInitial}
        </div>
        <div className="contributor-address">
          <strong>Contributor</strong>
          <span title={address}>{truncated}</span>
        </div>
      </header>

      {activity.length === 0 ? (
        <EmptyState
          illustration={<ContributorEmptySvg />}
          title="No activity yet."
          description="This contributor hasn't registered any datasets yet. Once they start contributing, their activity will appear here."
          ctaText="View Open Bounties"
          ctaHref="/bounties"
        />
      ) : (
        <div className="grid" role="list" aria-label={`Datasets by ${truncated}`}>
          {/* Dataset cards would render here */}
        </div>
      )}
    </div>
  );
}
