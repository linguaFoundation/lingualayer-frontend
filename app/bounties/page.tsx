'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';

interface Commission {
  id: string;
  language_code: string;
  language_name: string;
  description_ipfs: string;
  bounty_usdc: number;
  min_sample_count: number;
  min_duration_hours: number;
  deadline_ledger: number;
  state: 'open' | 'fulfilled' | 'cancelled';
  commissioner_truncated: string;
  fulfilled_by?: string;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

const LANGUAGES: Record<string, { name: string; flag: string }> = {
  yor: { name: 'Yoruba', flag: '🇳🇬' },
  hau: { name: 'Hausa', flag: '🇳🇬' },
  ibo: { name: 'Igbo', flag: '🇳🇬' },
  zul: { name: 'Zulu', flag: '🇿🇦' },
  swa: { name: 'Swahili', flag: '🇰🇪' },
  amh: { name: 'Amharic', flag: '🇪🇹' },
  som: { name: 'Somali', flag: '🇸🇴' },
  orm: { name: 'Oromo', flag: '🇪🇹' },
  ful: { name: 'Fula', flag: '🇳🇬' },
  lin: { name: 'Lingala', flag: '🇨🇩' },
  wol: { name: 'Wolof', flag: '🇸🇳' },
  sot: { name: 'Sotho', flag: '🇿🇦' },
  tir: { name: 'Tigrinya', flag: '🇪🇹' },
  aka: { name: 'Akan', flag: '🇬🇭' },
  ven: { name: 'Venda', flag: '🇿🇦' },
};

function BountyBoardContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read params from URL
  const selectedLang = searchParams.get('lang') || 'all';
  const filterState = (searchParams.get('state') as 'open' | 'all') || 'open';
  const sortBy = searchParams.get('sort') || 'bounty_desc';

  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeViewerCount, setActiveViewerCount] = useState(3);

  // Modals state
  const [claimingBounty, setClaimingBounty] = useState<Commission | null>(null);
  const [claimDatasetUrl, setClaimDatasetUrl] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postStep, setPostStep] = useState<1 | 2 | 3 | 4>(1);

  // Post form state
  const [postLang, setPostLang] = useState('yor');
  const [postMinSamples, setPostMinSamples] = useState(5000);
  const [postMinDuration, setPostMinDuration] = useState(10);
  const [postBountyUsdc, setPostBountyUsdc] = useState(500);
  const [postDeadlineDays, setPostDeadlineDays] = useState(14);
  const [postDescription, setPostDescription] = useState('');

  const { connection, sign } = useWallet();

  // Helper to update URL params
  const updateUrlParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all' || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    fetch(`${API}/commissions?state=${filterState}`)
      .then((r) => r.json())
      .then((d) => setCommissions(d.items ?? []))
      .catch(() => {
        // Fallback sample data if API is offline
        setCommissions([
          {
            id: 'comm-101',
            language_code: 'yor',
            language_name: 'Yoruba',
            description_ipfs: 'QmT123...YorubaSpokenCorpusV1',
            bounty_usdc: 750,
            min_sample_count: 10000,
            min_duration_hours: 25,
            deadline_ledger: 142000,
            state: 'open',
            commissioner_truncated: 'GBL3...9A12',
          },
          {
            id: 'comm-102',
            language_code: 'swa',
            language_name: 'Swahili',
            description_ipfs: 'QmX456...SwahiliAudioMedical',
            bounty_usdc: 1200,
            min_sample_count: 15000,
            min_duration_hours: 40,
            deadline_ledger: 180000,
            state: 'open',
            commissioner_truncated: 'GAXK...44F2',
          },
          {
            id: 'comm-103',
            language_code: 'hau',
            language_name: 'Hausa',
            description_ipfs: 'QmZ789...HausaConversational',
            bounty_usdc: 500,
            min_sample_count: 5000,
            min_duration_hours: 12,
            deadline_ledger: 110000,
            state: 'fulfilled',
            commissioner_truncated: 'GC7B...11D9',
            fulfilled_by: 'GB7A2KQL92XMMN334POQ112KLA9034LKNM22',
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, [filterState]);

  // Simulate WebSocket active viewer counter
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveViewerCount((prev) => Math.max(2, prev + (Math.random() > 0.5 ? 1 : -1)));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Filter & Sort Logic
  const filteredAndSortedCommissions = useMemo(() => {
    let result = [...commissions];

    // Filter by language
    if (selectedLang !== 'all') {
      result = result.filter((c) => c.language_code === selectedLang);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'bounty_desc') return b.bounty_usdc - a.bounty_usdc;
      if (sortBy === 'bounty_asc') return a.bounty_usdc - b.bounty_usdc;
      if (sortBy === 'deadline_asc') return a.deadline_ledger - b.deadline_ledger;
      if (sortBy === 'lang_asc') return a.language_code.localeCompare(b.language_code);
      return 0;
    });

    return result;
  }, [commissions, selectedLang, sortBy]);

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimingBounty) return;
    alert(`Successfully registered dataset claim for Bounty ${claimingBounty.id}!`);
    setClaimingBounty(null);
    setClaimDatasetUrl('');
  };

  const handlePostSubmit = async () => {
    if (!connection) return;
    try {
      // Mock signing step
      await sign('MOCK_XDR_TRANSACTION_PAYLOAD');
      alert(`Commission posted successfully for ${LANGUAGES[postLang]?.name || postLang}!`);
      setIsPosting(false);
      setPostStep(1);
    } catch (e: any) {
      alert(`Transaction failed: ${e.message}`);
    }
  };

  const userUsdcBalance = 1500; // Mock balance

  return (
    <div className="bounty-board">
      <header className="bounty-header">
        <div>
          <h1>Language Bounty Board</h1>
          <p className="bounty-subtitle">
            AI companies post USDC bounties for specific language datasets.
            Contributors claim by delivering and registering quality data on-chain.
          </p>
          <div className="bounty-live-badge">
            <span className="pulse-dot" />
            <span>🟢 {activeViewerCount} contributors looking at this</span>
          </div>
        </div>

        {connection ? (
          <button
            className="cta"
            id="post-commission-btn"
            onClick={() => {
              setIsPosting(true);
              setPostStep(1);
            }}
          >
            + Post a Commission
          </button>
        ) : (
          <p className="bounty-subtitle" style={{ fontSize: '0.86rem' }}>
            Connect wallet to post or claim bounties
          </p>
        )}
      </header>

      {/* Filter and Sort Toolbar */}
      <div className="bounty-toolbar">
        <div className="bounty-filters">
          <button
            className={`filter-pill ${filterState === 'open' ? 'active' : ''}`}
            onClick={() => updateUrlParams('state', 'open')}
          >
            Open Bounties
          </button>
          <button
            className={`filter-pill ${filterState === 'all' ? 'active' : ''}`}
            onClick={() => updateUrlParams('state', 'all')}
          >
            All States
          </button>

          {/* Language Selector Filter */}
          <select
            className="bounty-sort-select"
            value={selectedLang}
            onChange={(e) => updateUrlParams('lang', e.target.value)}
          >
            <option value="all">🌍 All Languages</option>
            {Object.entries(LANGUAGES).map(([code, info]) => (
              <option key={code} value={code}>
                {info.flag} {info.name} ({code.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Sort Select */}
        <div>
          <label style={{ fontSize: '0.84rem', color: 'var(--muted)', marginRight: 8 }}>Sort By:</label>
          <select
            className="bounty-sort-select"
            value={sortBy}
            onChange={(e) => updateUrlParams('sort', e.target.value)}
          >
            <option value="bounty_desc">Bounty: High to Low</option>
            <option value="bounty_asc">Bounty: Low to High</option>
            <option value="deadline_asc">Deadline: Soonest</option>
            <option value="lang_asc">Language Name</option>
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="bounty-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bounty-card" style={{ opacity: 0.5 }}>
              Loading bounties...
            </div>
          ))}
        </div>
      ) : (
        <div className="bounty-grid">
          {filteredAndSortedCommissions.length === 0 ? (
            <div className="bounty-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40 }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>No bounties match your filter.</span>
              <p style={{ color: 'var(--muted)', marginTop: 8 }}>
                Try selecting &quot;All Languages&quot; or clearing your filter parameters.
              </p>
            </div>
          ) : (
            filteredAndSortedCommissions.map((c) => {
              const langInfo = LANGUAGES[c.language_code] || {
                name: c.language_name || c.language_code,
                flag: '🌐',
              };

              return (
                <article key={c.id} className="bounty-card">
                  <div className="bounty-card-top">
                    <span className="lang-badge">
                      <span>{langInfo.flag}</span>
                      <span>{c.language_code.toUpperCase()}</span>
                    </span>
                    <span className={`state-badge state-${c.state}`}>{c.state}</span>
                  </div>

                  <h3>{langInfo.name} Dataset</h3>
                  <div className="bounty-amount">${c.bounty_usdc.toLocaleString()} USDC</div>

                  <ul className="bounty-reqs">
                    <li>
                      <span>📊</span> ≥ {c.min_sample_count.toLocaleString()} samples
                    </li>
                    <li>
                      <span>⏱️</span> ≥ {c.min_duration_hours}h of recorded audio
                    </li>
                    <li>
                      <span>📁</span> IPFS: {c.description_ipfs.slice(0, 14)}...
                    </li>
                  </ul>

                  <div className="bounty-footer">
                    <div>
                      <span>by {c.commissioner_truncated}</span>
                      {c.state === 'fulfilled' && c.fulfilled_by && (
                        <div style={{ marginTop: 4 }}>
                          Fulfilled by:{' '}
                          <a
                            href={`https://stellar.expert/explorer/public/account/${c.fulfilled_by}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="stellar-link"
                          >
                            {c.fulfilled_by.slice(0, 6)}...{c.fulfilled_by.slice(-4)}
                          </a>
                        </div>
                      )}
                    </div>

                    {c.state === 'open' && connection && (
                      <button
                        className="cta-sm"
                        id={`claim-${c.id}`}
                        onClick={() => setClaimingBounty(c)}
                      >
                        Claim Bounty
                      </button>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}

      {/* Claim Bounty Modal */}
      {claimingBounty && (
        <div className="modal-overlay" onClick={() => setClaimingBounty(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Claim Bounty: {claimingBounty.language_code.toUpperCase()} Dataset</h2>
              <button className="modal-close" onClick={() => setClaimingBounty(null)}>
                ×
              </button>
            </div>

            <form onSubmit={handleClaimSubmit}>
              <div className="form-group">
                <label>Reward</label>
                <input
                  className="form-control"
                  readOnly
                  value={`$${claimingBounty.bounty_usdc.toLocaleString()} USDC`}
                />
              </div>

              <div className="form-group">
                <label>Requirements</label>
                <input
                  className="form-control"
                  readOnly
                  value={`≥ ${claimingBounty.min_sample_count} samples | ≥ ${claimingBounty.min_duration_hours}h audio`}
                />
              </div>

              <div className="form-group">
                <label>Dataset IPFS Hash / URL</label>
                <input
                  className="form-control"
                  placeholder="ipfs://Qm... or https://huggingface.co/datasets/..."
                  required
                  value={claimDatasetUrl}
                  onChange={(e) => setClaimDatasetUrl(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
                <button
                  type="button"
                  className="filter-pill"
                  onClick={() => setClaimingBounty(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="cta-sm">
                  Register Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Commission Multi-Step Modal */}
      {isPosting && (
        <div className="modal-overlay" onClick={() => setIsPosting(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Post a New Commission</h2>
              <button className="modal-close" onClick={() => setIsPosting(false)}>
                ×
              </button>
            </div>

            <div className="step-indicator">
              <div className={`step-dot ${postStep >= 1 ? 'active' : ''}`} />
              <div className={`step-dot ${postStep >= 2 ? 'active' : ''}`} />
              <div className={`step-dot ${postStep >= 3 ? 'active' : ''}`} />
              <div className={`step-dot ${postStep >= 4 ? 'active' : ''}`} />
            </div>

            {/* Step 1: Language & Requirements */}
            {postStep === 1 && (
              <div>
                <h3>Step 1: Language & Requirements</h3>
                <div className="form-group" style={{ marginTop: 14 }}>
                  <label>Language</label>
                  <select
                    className="form-control"
                    value={postLang}
                    onChange={(e) => setPostLang(e.target.value)}
                  >
                    {Object.entries(LANGUAGES).map(([code, info]) => (
                      <option key={code} value={code}>
                        {info.flag} {info.name} ({code.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Min Sample Count</label>
                  <input
                    type="number"
                    className="form-control"
                    value={postMinSamples}
                    onChange={(e) => setPostMinSamples(Number(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label>Min Duration (Hours)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={postMinDuration}
                    onChange={(e) => setPostMinDuration(Number(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label>Description / Guidelines</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Describe audio quality, dialect preferences, transcription formats..."
                    value={postDescription}
                    onChange={(e) => setPostDescription(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                  <button className="cta-sm" onClick={() => setPostStep(2)}>
                    Next: Reward & Deadline →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Reward & Deadline */}
            {postStep === 2 && (
              <div>
                <h3>Step 2: Reward & Deadline</h3>
                <div className="form-group" style={{ marginTop: 14 }}>
                  <label>Bounty Amount (USDC)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={postBountyUsdc}
                    onChange={(e) => setPostBountyUsdc(Number(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label>Deadline (Days)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={postDeadlineDays}
                    onChange={(e) => setPostDeadlineDays(Number(e.target.value))}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                  <button className="filter-pill" onClick={() => setPostStep(1)}>
                    ← Back
                  </button>
                  <button className="cta-sm" onClick={() => setPostStep(3)}>
                    Next: Validate Balance →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Validate USDC Balance */}
            {postStep === 3 && (
              <div>
                <h3>Step 3: Validate Wallet Balance</h3>
                <div style={{ marginTop: 14 }}>
                  <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                    Verify that your connected wallet has enough USDC to lock into the Soroban escrow contract.
                  </p>

                  <div className="form-group">
                    <label>Required Escrow</label>
                    <input className="form-control" readOnly value={`${postBountyUsdc} USDC`} />
                  </div>

                  <div className="form-group">
                    <label>Your USDC Balance</label>
                    <input className="form-control" readOnly value={`${userUsdcBalance} USDC`} />
                  </div>

                  {userUsdcBalance < postBountyUsdc ? (
                    <div className="balance-warning">
                      ⚠️ Insufficient USDC balance ({userUsdcBalance} USDC). Please top up your wallet.
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: 10,
                        background: 'rgba(94, 233, 168, 0.15)',
                        border: '1px solid rgba(94, 233, 168, 0.3)',
                        color: '#5ee9a8',
                        fontSize: '0.86rem',
                        marginBottom: 16,
                      }}
                    >
                      ✅ Balance verified! You have sufficient USDC for this commission.
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                  <button className="filter-pill" onClick={() => setPostStep(2)}>
                    ← Back
                  </button>
                  <button
                    className="cta-sm"
                    disabled={userUsdcBalance < postBountyUsdc}
                    onClick={() => setPostStep(4)}
                  >
                    Next: Sign Transaction →
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Wallet Sign */}
            {postStep === 4 && (
              <div>
                <h3>Step 4: Sign & Broadcast</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 14 }}>
                  Clicking below will prompt your connected wallet ({connection?.walletType}) to sign the Soroban contract call.
                </p>

                <div
                  style={{
                    background: 'var(--bg)',
                    padding: 14,
                    borderRadius: 10,
                    fontSize: '0.85rem',
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <strong>Language:</strong> {LANGUAGES[postLang]?.name} ({postLang.toUpperCase()})
                  </div>
                  <div>
                    <strong>Amount:</strong> {postBountyUsdc} USDC
                  </div>
                  <div>
                    <strong>Requirements:</strong> ≥ {postMinSamples} samples, ≥ {postMinDuration}h
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                  <button className="filter-pill" onClick={() => setPostStep(3)}>
                    ← Back
                  </button>
                  <button className="cta-sm" onClick={handlePostSubmit}>
                    🔐 Sign & Publish Commission
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BountyBoardPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Loading Bounty Board...</div>}>
      <BountyBoardContent />
    </Suspense>
  );
}
