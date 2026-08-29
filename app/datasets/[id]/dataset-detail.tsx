'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { QualityBadge, type QualityTier } from '@/components/quality-badge';
import { CountdownTimer } from '@/components/countdown-timer';
import { useWallet } from '@/contexts/WalletContext';
import { signTransaction } from '@/lib/wallets-kit';
import {
  currentNetwork,
  defaultHorizonUrl,
  explorerUrl,
  pollTransactionStatus,
} from '@/lib/tx-status';
import {
  LICENSE_OPTIONS,
  prepareLicensePurchase,
  purchaseErrorMessage,
  submitLicenseTransaction,
  type LicenseTypeId,
} from '@/lib/license-purchase';

interface Contributor {
  address: string;
  /** Royalty share in basis points (0–10000). */
  share_bps: number;
}

interface Dataset {
  dataset_id: string;
  name: string;
  language_code: string;
  version: string;
  state: string;
  description?: string;
  sample_count: number;
  hours_of_audio?: number;
  collection_method?: string;
  owner: string;
  contributors?: Contributor[];
}

interface QualityInfo {
  tier: QualityTier;
  score: number;
  multiplier: number;
  curator_count: number;
}

type PurchaseState =
  | { status: 'idle' }
  | { status: 'preparing'; type: LicenseTypeId }
  | { status: 'awaiting-signature'; type: LicenseTypeId }
  | { status: 'submitting'; type: LicenseTypeId }
  | { status: 'confirming'; type: LicenseTypeId; hash: string }
  | { status: 'success'; hash: string; licenseId: string; expiresAt?: string }
  | { status: 'error'; message: string };

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';
const BASE_ROYALTY_USDC = 10;
const POLL_INTERVAL_MS = 5000;

function basisPointsToPercent(bps: number): string {
  const pct = bps / 100;
  return `${bps % 100 === 0 ? pct.toFixed(0) : pct.toFixed(2)}%`;
}

function truncateAddress(address: string): string {
  return address.length > 10 ? `${address.slice(0, 4)}…${address.slice(-4)}` : address;
}

export function DatasetDetail({ id }: { id: string }) {
  const { connection, connect } = useWallet();

  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [quality, setQuality] = useState<QualityInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<LicenseTypeId>('research');
  const [purchase, setPurchase] = useState<PurchaseState>({ status: 'idle' });

  const fetchQuality = useCallback(() => {
    fetch(`${API}/datasets/${id}/quality`)
      .then((r) => r.json())
      .then((q) =>
        setQuality({
          tier: q.tier ?? 'Unrated',
          score: q.score ?? 0,
          multiplier: q.multiplier ?? 1,
          curator_count: q.curator_count ?? 0,
        })
      )
      .catch(() => setQuality((prev) => prev ?? { tier: 'Unrated', score: 0, multiplier: 1, curator_count: 0 }));
  }, [id]);

  useEffect(() => {
    fetch(`${API}/datasets/${id}`)
      .then((r) => r.json())
      .then((d) => setDataset(d))
      .catch(() => setDataset(null))
      .finally(() => setLoading(false));

    fetchQuality();
    const interval = setInterval(fetchQuality, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [id, fetchQuality]);

  const purchaseLicense = useCallback(
    async (type: LicenseTypeId) => {
      if (!connection) {
        void connect();
        return;
      }
      try {
        setPurchase({ status: 'preparing', type });
        const { xdr } = await prepareLicensePurchase(id, type, connection.address);

        setPurchase({ status: 'awaiting-signature', type });
        const signedXdr = await signTransaction(xdr, connection.address);

        setPurchase({ status: 'submitting', type });
        const result = await submitLicenseTransaction(signedXdr);

        setPurchase({ status: 'confirming', type, hash: result.hash });
        const final = await pollTransactionStatus(result.hash, defaultHorizonUrl(), () => {});

        if (final.status === 'confirmed') {
          setPurchase({
            status: 'success',
            hash: result.hash,
            licenseId: result.license_id,
            expiresAt: result.expires_at,
          });
        } else {
          setPurchase({
            status: 'error',
            message: final.errorMessage ?? 'Transaction was not confirmed.',
          });
        }
      } catch (err) {
        setPurchase({ status: 'error', message: purchaseErrorMessage(err) });
      }
    },
    [connection, connect, id],
  );

  if (loading) {
    return (
      <section className="section">
        <p style={{ color: 'var(--muted)' }}>Loading dataset…</p>
      </section>
    );
  }

  const effectiveRoyalty = quality ? BASE_ROYALTY_USDC * quality.multiplier : BASE_ROYALTY_USDC;
  const isPlatinum = quality?.tier === 'Platinum';
  const busy =
    purchase.status === 'preparing' ||
    purchase.status === 'awaiting-signature' ||
    purchase.status === 'submitting' ||
    purchase.status === 'confirming';

  return (
    <section className="section">
      <Link href="/datasets" style={{ color: 'var(--muted)', fontSize: 14 }}>
        ← Back to datasets
      </Link>
      <span className="tag">Dataset</span>

      <div className="dataset-header-row">
        <h2>{dataset?.name ?? id}</h2>
        {dataset && (
          <>
            <span className="state-badge" aria-label={`Version ${dataset.version}`}>
              v{dataset.version}
            </span>
            <span className={`state-badge state-${dataset.state}`} aria-label={`State: ${dataset.state}`}>
              {dataset.state}
            </span>
          </>
        )}
      </div>

      {dataset && (
        <p style={{ color: 'var(--muted)' }}>
          {dataset.language_code.toUpperCase()} · {dataset.sample_count.toLocaleString()} samples · owned by{' '}
          {dataset.owner}
        </p>
      )}

      {dataset && (
        <div className="card" style={{ marginTop: 20, maxWidth: 560 }}>
          <h3>Dataset metadata</h3>
          {dataset.description && <p>{dataset.description}</p>}
          <dl className="economics-rows">
            <div className="economics-row">
              <dt>Samples</dt>
              <dd>{dataset.sample_count.toLocaleString()}</dd>
            </div>
            {dataset.hours_of_audio !== undefined && (
              <div className="economics-row">
                <dt>Hours of audio</dt>
                <dd>{dataset.hours_of_audio.toLocaleString()}h</dd>
              </div>
            )}
            {dataset.collection_method && (
              <div className="economics-row">
                <dt>Collection method</dt>
                <dd>{dataset.collection_method}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      <div
        className="card economics-card"
        style={{
          marginTop: 20,
          maxWidth: 420,
          ...(isPlatinum
            ? {
                borderImage: 'linear-gradient(135deg, #8b5cf6, #c4b5fd) 1',
                borderWidth: 2,
                borderStyle: 'solid',
              }
            : {}),
        }}
      >
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          Economics
          {quality && <QualityBadge tier={quality.tier} score={quality.score} compact />}
        </h3>

        <dl className="economics-rows">
          <div className="economics-row">
            <dt>Base royalty</dt>
            <dd>{BASE_ROYALTY_USDC} USDC</dd>
          </div>
          <div className="economics-row">
            <dt>Quality multiplier</dt>
            <dd
              title={
                isPlatinum
                  ? `Platinum-tier datasets earn 50% more per license. Verified by ${quality?.curator_count ?? 0} curators.`
                  : undefined
              }
            >
              {(quality?.multiplier ?? 1).toFixed(1)}× {quality && `(${quality.tier})`}
            </dd>
          </div>
          <div className="economics-row economics-row--total">
            <dt>Effective royalty</dt>
            <dd>{effectiveRoyalty.toFixed(1)} USDC → to contributors</dd>
          </div>
        </dl>
      </div>

      {dataset?.contributors && dataset.contributors.length > 0 && (
        <div className="card" style={{ marginTop: 20, maxWidth: 560 }}>
          <h3>Contributors</h3>
          <div className="contributor-grid">
            {dataset.contributors.map((c) => (
              <div key={c.address} className="contributor-chip" title={c.address}>
                <span className="contributor-avatar" aria-hidden="true">
                  {c.address.slice(0, 2).toUpperCase()}
                </span>
                <span className="contributor-address">{truncateAddress(c.address)}</span>
                <span className="contributor-share">{basisPointsToPercent(c.share_bps)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: 20, maxWidth: 640 }}>
        <h3>License options</h3>
        <div className="license-option-grid">
          {LICENSE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`license-option${selectedType === opt.id ? ' license-option--selected' : ''}`}
              onClick={() => setSelectedType(opt.id)}
              aria-pressed={selectedType === opt.id}
            >
              <span className="license-option-label">{opt.label}</span>
              <span className="license-option-price">
                {opt.priceUsd === 0 ? 'Free' : `$${opt.priceUsd.toFixed(2)}`}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="cta"
          style={{ marginTop: 16 }}
          onClick={() => purchaseLicense(selectedType)}
          disabled={busy}
        >
          {!connection
            ? 'Connect wallet to purchase'
            : busy
              ? 'Processing…'
              : `Purchase ${LICENSE_OPTIONS.find((o) => o.id === selectedType)?.label} License`}
        </button>

        {purchase.status === 'preparing' && <p role="status">Preparing transaction…</p>}
        {purchase.status === 'awaiting-signature' && (
          <p role="status">Review and sign the transaction in your wallet…</p>
        )}
        {purchase.status === 'submitting' && <p role="status">Submitting to the network…</p>}
        {purchase.status === 'confirming' && <p role="status">Waiting for ledger confirmation…</p>}

        {purchase.status === 'error' && (
          <p className="tx-status-error" role="alert">
            {purchase.message}
          </p>
        )}

        {purchase.status === 'success' && (
          <div className="license-success" role="status">
            <p>✅ License purchased — ID {purchase.licenseId}</p>
            <a
              href={explorerUrl(purchase.hash, currentNetwork())}
              target="_blank"
              rel="noreferrer"
              className="tx-status-hash-link"
            >
              View transaction on stellar.expert
            </a>
            {purchase.expiresAt && <CountdownTimer targetDate={new Date(purchase.expiresAt)} />}
          </div>
        )}
      </div>
    </section>
  );
}
