'use client';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { openWalletModal, disconnectWallet } from '@/lib/wallets-kit';
import { sep010Auth, storeToken, loadToken, clearToken } from '@/lib/sep010';
import { fetchAccountBalances, type AccountBalances } from '@/lib/balances';

interface WalletConnection {
  address: string;
  walletId: string;
}

interface WalletContextType {
  connection: WalletConnection | null;
  isConnecting: boolean;
  error: string | null;
  /** Null before the first balance fetch resolves (or if it failed). */
  balances: AccountBalances | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  /** Re-fetches balances for the connected account, e.g. after a purchase. */
  refreshBalances: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [connection, setConnection] = useState<WalletConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balances, setBalances] = useState<AccountBalances | null>(null);

  // Restore a still-valid SEP-0010 session after a page refresh. Runs after
  // mount (not as a lazy useState initializer) so the client's first render
  // matches the server's, avoiding a hydration mismatch.
  useEffect(() => {
    const existing = loadToken();
    if (existing) setConnection({ address: existing.address, walletId: '' });
  }, []);

  const refreshBalances = useCallback(async () => {
    if (!connection) {
      setBalances(null);
      return;
    }
    try {
      setBalances(await fetchAccountBalances(connection.address));
    } catch {
      // A balance-fetch failure shouldn't take down the connection itself —
      // the button just shows no balance until the next successful refresh.
      setBalances(null);
    }
  }, [connection]);

  // Fetches balances whenever the connected address changes (including on
  // restore-from-refresh above), and clears them on disconnect.
  useEffect(() => {
    void refreshBalances();
  }, [refreshBalances]);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const { address, walletId } = await openWalletModal();
      const token = await sep010Auth(address);
      storeToken(token);
      setConnection({ address, walletId });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    clearToken();
    setConnection(null);
    setBalances(null);
    void disconnectWallet();
  }, []);

  return (
    <WalletContext.Provider
      value={{ connection, isConnecting, error, balances, connect, disconnect, refreshBalances }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
};
