'use client';
import type { ReactNode } from 'react';
import { useWallet } from '@/contexts/WalletContext';

interface WalletGuardProps {
  children: ReactNode;
  /** Shown above the connect prompt, e.g. what the page needs a wallet for. */
  message?: string;
}

/**
 * Wraps a page (or section) that requires a connected wallet (issue #1).
 * Renders its children once `connection` exists; otherwise shows a connect
 * prompt in place of the protected content, rather than letting the page
 * render broken or empty.
 */
export function WalletGuard({ children, message }: WalletGuardProps) {
  const { connection, isConnecting, error, connect } = useWallet();

  if (connection) return <>{children}</>;

  return (
    <div className="wallet-guard" role="status">
      <p className="wallet-guard-message">
        {message ?? 'Connect a wallet to continue.'}
      </p>
      <button type="button" className="cta" onClick={() => void connect()} disabled={isConnecting}>
        {isConnecting ? 'Connecting…' : 'Connect Wallet'}
      </button>
      {error && (
        <p className="wallet-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
