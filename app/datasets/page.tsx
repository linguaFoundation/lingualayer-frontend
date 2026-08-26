'use client';
import { useState, useEffect, useMemo, useRef, useCallback, type CSSProperties } from 'react';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { DatasetsIllustration } from '@/components/illustrations';
import { QualityBadge, type QualityTier } from '@/components/quality-badge';
import { ShareButtons } from '@/components/share-buttons';
import { SkeletonCard } from '@/components/skeleton-card';
import { LANGUAGE_FAMILIES, languageFamily, languageName, type LanguageFamily } from '@/lib/languages';
import { LICENSE_TYPES, cheapestPaidPrice, type DatasetLicenseOffer, type LicenseTypeId } from '@/lib/licensing';

interface Dataset {
  dataset_id: string;
  name: string;
  description?: string;
  language_code: string;
  owner: string;
  sample_count: number;
  contributor_count?: number;
  license_offers?: DatasetLicenseOffer[];
  license_count?: number;
  created_at?: string;
  quality_tier?: QualityTier;
  quality_score?: number;
}

interface DatasetPage {
  datasets: Dataset[];
  next_cursor?: string | null;
}

type SortOption = 'newest' | 'most_licensed' | 'price_asc' | 'price_desc';
type SizeBucket = '' | 'small' | 'medium' | 'large';

const PAGE_SIZE = 20;
const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

function sizeBucketOf(sampleCount: number): Exclude<SizeBucket, ''> {
  if (sampleCount < 1_000) return 'small';
  if (sampleCount < 10_000) return 'medium';
  return 'large';
}

async function fetchDatasetsPage(cursor: string | null): Promise<DatasetPage> {
  const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
  if (cursor) params.set('cursor', cursor);
  const res = await fetch(`${API}/datasets?${params.toString()}`);
  const body = await res.json();
  return { datasets: body.datasets ?? [], next_cursor: body.next_cursor ?? null };
}

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('');
  const [family, setFamily] = useState<LanguageFamily | ''>('');
  const [licenseType, setLicenseType] = useState<LicenseTypeId | ''>('');
  const [sizeBucket, setSizeBucket] = useState<SizeBucket>('');
  const [sort, setSort] = useState<SortOption>('newest');

  const loadedOnce = useRef(false);

  const loadFirstPage = useCallback(() => {
    setLoading(true);
    fetchDatasetsPage(null)
      .then((page) => {
        setDatasets(page.datasets);
        setCursor(page.next_cursor ?? null);
        setHasMore(Boolean(page.next_cursor));
      })
      .catch(() => {
        setDatasets([]);
        setHasMore(false);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loadedOnce.current) return;
    loadedOnce.current = true;
    loadFirstPage();
  }, [loadFirstPage]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    fetchDatasetsPage(cursor)
      .then((page) => {
        setDatasets((prev) => [...prev, ...page.datasets]);
        setCursor(page.next_cursor ?? null);
        setHasMore(Boolean(page.next_cursor));
      })
      .catch(() => setHasMore(false))
      .finally(() => setLoadingMore(false));
  }, [cursor, hasMore, loadingMore]);

  // Infinite scroll: observe a sentinel below the grid. Falls back to the
  // always-rendered "Load more" button in environments without
  // IntersectionObserver (older browsers, and jsdom in tests).
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: '200px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  const hasFilters =
    query.trim() !== '' ||
    language !== '' ||
    family !== '' ||
    licenseType !== '' ||
    sizeBucket !== '';

  const visible = useMemo(() => {
    const filtered = datasets.filter((d) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        q === '' ||
        d.name.toLowerCase().includes(q) ||
        (d.description ?? '').toLowerCase().includes(q);
      const matchesLanguage = language === '' || d.language_code === language;
      const matchesFamily = family === '' || languageFamily(d.language_code) === family;
      const matchesLicense =
        licenseType === '' || (d.license_offers ?? []).some((o) => o.type === licenseType);
      const matchesSize = sizeBucket === '' || sizeBucketOf(d.sample_count) === sizeBucket;
      return matchesQuery && matchesLanguage && matchesFamily && matchesLicense && matchesSize;
    });

    const sorted = [...filtered];
    switch (sort) {
      case 'most_licensed':
        sorted.sort((a, b) => (b.license_count ?? 0) - (a.license_count ?? 0));
        break;
      case 'price_asc':
        sorted.sort(
          (a, b) =>
            cheapestPaidPrice(a.license_offers ?? []) - cheapestPaidPrice(b.license_offers ?? []),
        );
        break;
      case 'price_desc':
        sorted.sort(
          (a, b) =>
            cheapestPaidPrice(b.license_offers ?? []) - cheapestPaidPrice(a.license_offers ?? []),
        );
        break;
      case 'newest':
      default:
        sorted.sort(
          (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime(),
        );
    }
    return sorted;
  }, [datasets, query, language, family, licenseType, sizeBucket, sort]);

  const clearFilters = () => {
    setQuery('');
    setLanguage('');
    setFamily('');
    setLicenseType('');
    setSizeBucket('');
  };

  const languages = useMemo(
    () => Array.from(new Set(datasets.map((d) => d.language_code))).sort(),
    [datasets],
  );

  return (
    <section className="section">
      <span className="tag">Datasets</span>
      <h2>Dataset marketplace</h2>
      <p style={{ color: 'var(--muted)', maxWidth: 640 }}>
        Browse African language datasets registered on-chain and available to license.
      </p>

      <div className="dataset-filters" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '18px 0' }}>
        <input
          type="search"
          placeholder="Search datasets…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search datasets by name"
          style={filterInputStyle}
        />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          aria-label="Filter datasets by language"
          style={filterInputStyle}
        >
          <option value="">All languages</option>
          {languages.map((code) => (
            <option key={code} value={code}>
              {languageName(code)} ({code.toUpperCase()})
            </option>
          ))}
        </select>
        <select
          value={family}
          onChange={(e) => setFamily(e.target.value as LanguageFamily | '')}
          aria-label="Filter datasets by language family"
          style={filterInputStyle}
        >
          <option value="">All language families</option>
          {LANGUAGE_FAMILIES.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <select
          value={licenseType}
          onChange={(e) => setLicenseType(e.target.value as LicenseTypeId | '')}
          aria-label="Filter datasets by license type"
          style={filterInputStyle}
        >
          <option value="">All license types</option>
          {LICENSE_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          value={sizeBucket}
          onChange={(e) => setSizeBucket(e.target.value as SizeBucket)}
          aria-label="Filter datasets by size"
          style={filterInputStyle}
        >
          <option value="">Any size</option>
          <option value="small">Small (&lt; 1k samples)</option>
          <option value="medium">Medium (1k–10k samples)</option>
          <option value="large">Large (10k+ samples)</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          aria-label="Sort datasets"
          style={filterInputStyle}
        >
          <option value="newest">Newest</option>
          <option value="most_licensed">Most licensed</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>

      {loading ? (
        <div className="grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          illustration={
            <DatasetsIllustration label="A magnifier over stacked data layers, no datasets found" />
          }
          title={hasFilters ? 'No datasets match your filters' : 'No datasets yet'}
          message={
            hasFilters
              ? 'Try removing some filters to see more results.'
              : 'Datasets registered on-chain will appear here. Post a bounty to commission one.'
          }
          cta={
            hasFilters
              ? { label: 'Clear filters', onClick: clearFilters }
              : { label: 'Browse bounties', href: '/bounties' }
          }
        />
      ) : (
        <>
          <div className="grid">
            {visible.map((d) => (
              <article key={d.dataset_id}>
                <Link
                  href={`/datasets/${d.dataset_id}`}
                  className="card"
                  style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="card-top-row">
                    <h3>{d.name}</h3>
                    <QualityBadge tier={d.quality_tier ?? 'Unrated'} score={d.quality_score} compact />
                  </div>
                  <p>
                    {languageName(d.language_code)} ({d.language_code.toUpperCase()}) ·{' '}
                    {d.sample_count.toLocaleString()} samples
                  </p>
                  <p>
                    {d.contributor_count ?? 0} contributor{d.contributor_count === 1 ? '' : 's'}
                    {d.license_offers && d.license_offers.length > 0 && (
                      <> · from ${cheapestPaidPrice(d.license_offers).toFixed(2)}</>
                    )}
                  </p>
                </Link>
                {d.quality_tier === 'Platinum' && (
                  <ShareButtons
                    text={`${d.name} just reached Platinum quality on @LinguaLayer! 🌍🎙️ Join us in building the future of African AI.`}
                    ogParams={{ lang: d.language_code.toUpperCase(), tier: 'Platinum' }}
                  />
                )}
              </article>
            ))}
            {loadingMore &&
              Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={`more-${i}`} />)}
          </div>

          {hasMore && !hasFilters && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 32px' }}>
              <button type="button" className="cta-secondary" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
          <div ref={sentinelRef} aria-hidden="true" style={{ height: 1 }} />
        </>
      )}
    </section>
  );
}

const filterInputStyle: CSSProperties = {
  padding: '10px 14px',
  borderRadius: 10,
  background: 'color-mix(in srgb, var(--surface) 85%, var(--bg))',
  border: '1px solid color-mix(in srgb, var(--accent) 24%, transparent)',
  color: 'var(--text)',
  minWidth: 180,
};
