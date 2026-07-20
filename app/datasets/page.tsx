'use client';
import { useState } from 'react';
import { EmptyState } from '@/components/empty-state';
import { DatasetsEmptySvg } from '@/components/illustrations';
import { QualityBadge, type QualityTier } from '@/components/quality-badge';

/**
 * /datasets — Dataset discovery page.
 *
 * Renders a live filter bar. When no datasets match the active query / filters
 * the DatasetsEmptyState is shown with a "Clear Filters" CTA.
 */
export default function DatasetsPage() {
  const [query, setQuery] = useState('');

  // In production this list would be fetched from the API and filtered server-
  // side or client-side. For now it is mocked to demonstrate the badges.
  const datasets = [
    { id: 'yor-01', title: 'Yoruba ASR Conversational', language: 'yor', tier: 'Gold' as QualityTier, score: 92, samples: 14500 },
    { id: 'ibo-02', title: 'Igbo News Transcription', language: 'ibo', tier: 'Silver' as QualityTier, score: 78, samples: 8200 },
    { id: 'hau-01', title: 'Hausa Medical Parallel', language: 'hau', tier: 'Unrated' as QualityTier, score: undefined, samples: 3400 },
  ];
  const filtered = query.trim() ? datasets.filter(d => d.title.toLowerCase().includes(query.toLowerCase()) || d.language.includes(query.toLowerCase())) : datasets;

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
          {filtered.map(d => (
            <article key={d.id} className="card" style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: 18, right: 18 }}>
                <QualityBadge tier={d.tier} score={d.score} compact />
              </div>
              <span className="lang-badge">{d.language.toUpperCase()}</span>
              <h3 style={{ marginTop: 12 }}>{d.title}</h3>
              <p>{d.samples.toLocaleString()} samples</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

