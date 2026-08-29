'use client';
import { useWallet } from '@/contexts/WalletContext';

function truncate(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

function formatBalance(amount: number): string {
  return amount.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function WalletConnectButton() {
  const { connection, isConnecting, error, balances, connect, disconnect } = useWallet();

  return (
    <div className="wallet-connect">
      {connection ? (
        <button
          type="button"
          className="wallet-btn wallet-btn--connected"
          onClick={disconnect}
          title={`${connection.address} — click to disconnect`}
        >
          <span className="wallet-btn-address">{truncate(connection.address)}</span>
          {balances && (
            <span className="wallet-btn-balance">
              {formatBalance(balances.xlm)} XLM
              {balances.usdc !== null && ` · ${formatBalance(balances.usdc)} USDC`}
            </span>
          )}
        </button>
      ) : (
        <button type="button" className="wallet-btn" onClick={() => void connect()} disabled={isConnecting}>
          {isConnecting ? 'Connecting…' : 'Connect Wallet'}
        </button>
      )}
      {error && (
        <span className="wallet-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
