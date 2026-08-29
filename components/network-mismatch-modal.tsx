"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { stellarNetworkConfig } from "@/lib/stellar-network";

/**
 * Warning modal shown when the connected wallet's network doesn't match
 * this deployment's configured network (issue #7), dismissible per
 * connection (issue #1) — closing it doesn't fix the mismatch, so it
 * reopens the next time a wallet connects while still on the wrong network.
 *
 * `WalletContext`'s connection doesn't carry a network field (the kit's
 * `authModal()`/SEP-0010 flow only returns an address), so this checks
 * Freighter directly via `getNetwork()` once a wallet is connected — the
 * multi-wallet kit itself has no wallet-agnostic "what network is the
 * active wallet on" query. Renders nothing for a non-Freighter wallet or
 * while the check is in flight; a false negative here just means no
 * warning, never a wrong one.
 */
export function NetworkMismatchModal() {
  const { connection } = useWallet();
  const [walletNetwork, setWalletNetwork] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(false);
    if (!connection) {
      setWalletNetwork(null);
      return;
    }
    let cancelled = false;
    void import("@stellar/freighter-api")
      .then((freighter) => freighter.getNetwork())
      .then((result) => {
        if (!cancelled && !result.error) setWalletNetwork(result.network);
      })
      .catch(() => {
        /* Not Freighter, or the extension declined — no mismatch check possible. */
      });
    return () => {
      cancelled = true;
    };
  }, [connection]);

  if (!connection || !walletNetwork || dismissed) return null;

  const walletIsTestnet = walletNetwork === "TESTNET";
  const configuredIsTestnet = stellarNetworkConfig.network === "testnet";
  if (walletIsTestnet === configuredIsTestnet) return null;

  return (
    <div className="network-mismatch-overlay" role="alertdialog" aria-modal="true" aria-labelledby="network-mismatch-title">
      <div className="network-mismatch-modal">
        <button
          type="button"
          className="network-mismatch-dismiss"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
        >
          ×
        </button>
        <h2 id="network-mismatch-title">Wrong network</h2>
        <p>
          Your wallet is connected to <strong>{walletIsTestnet ? "testnet" : "mainnet"}</strong>, but
          this app is running on <strong>{stellarNetworkConfig.network}</strong>. Switch your
          wallet&apos;s network to continue.
        </p>
      </div>
    </div>
  );
}
