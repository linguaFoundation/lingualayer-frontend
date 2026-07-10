'use client';
import { useState } from 'react';
import { EmptyState } from '@/components/empty-state';
import { DatasetsEmptySvg } from '@/components/illustrations';

/**
 * /datasets — Dataset discovery page.
 *
 * Renders a live filter bar. When no datasets match the active query / filters
 * the DatasetsEmptyState is shown with a "Clear Filters" CTA.
 */
export default function DatasetsPage() {
  const [query, setQuery] = useState('');

  // In production this list would be fetched from the API and filtered server-
  // side or client-side. For now it is empty to demonstrate the empty state.
  const datasets: unknown[] = [];
  const filtered = datasets.filter(() => true); // placeholder filter

  const hasQuery = query.trim().length > 0;

  return (
    <div className="datasets-page">
      <header className="datasets-header">
        <span className="tag">Datasets</span>
        <h1>Language Datasets</h1>
        <p className="datasets-subtitle">
          Explore community-contributed African language datasets. Browse by
          language, format, or license to find the right data for your model.
        </p>
      </header>

      {/* Filter bar */}
      <div className="datasets-filter-bar" role="search" aria-label="Filter datasets">
        <label htmlFor="dataset-search">Search datasets</label>
        <input
          id="dataset-search"
          type="search"
          placeholder="e.g. Yoruba, ASR, CC-BY…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoComplete="off"
          aria-label="Search datasets by language, format, or license"
        />
        {hasQuery && (
          <button
            id="clear-filters-btn"
            className="filter-pill"
            onClick={() => setQuery('')}
            aria-label="Clear search filters"
          >
            Clear filters ✕
          </button>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState
          illustration={<DatasetsEmptySvg />}
          title={hasQuery ? 'No datasets match your filters.' : 'No datasets yet.'}
          description={
            hasQuery
              ? 'Try removing some filters or adjusting your search terms to see more results.'
              : 'No language datasets have been registered on-chain yet. Check back soon or start contributing!'
          }
          ctaText={hasQuery ? 'Browse all datasets' : 'Browse Bounties'}
          ctaHref="/bounties"
        />
      ) : (
        <div className="grid" role="list" aria-label="Dataset list">
          {/* Dataset cards would render here */}
        </div>
      )}
    </div>
  );
}

