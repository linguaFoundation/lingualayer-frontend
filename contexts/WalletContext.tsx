'use client';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  openWalletModal,
  connectWallet,
  signTransaction,
  disconnectWallet,
  getPersistedWalletId,
} from '@/lib/wallets-kit';

export interface WalletConnection {
  address: string;
  publicKey: string;
  walletId: string;
  network: 'testnet' | 'mainnet';
}

interface WalletContextType {
  connection: WalletConnection | null;
  isConnecting: boolean;
  error: string | null;
  /** Opens the Stellar Wallets Kit's built-in wallet-selector modal. */
  connect: () => Promise<void>;
  disconnect: () => void;
  sign: (xdr: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | null>(null);

const NETWORK: 'testnet' | 'mainnet' =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'mainnet' ? 'mainnet' : 'testnet';

function toConnection(address: string, walletId: string): WalletConnection {
  return { address, publicKey: address, walletId, network: NETWORK };
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [connection, setConnection] = useState<WalletConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-reconnect: if a wallet id was persisted from a previous session,
  // silently re-fetch its address on mount instead of showing the picker.
  useEffect(() => {
    const persistedId = getPersistedWalletId();
    if (!persistedId) return;
    connectWallet(persistedId)
      .then((address) => setConnection(toConnection(address, persistedId)))
      .catch(() => {
        // Stale/unavailable wallet — leave the user logged out rather than
        // surfacing an error for a connection they didn't just request.
      });
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const { address, walletId } = await openWalletModal();
      setConnection(toConnection(address, walletId));
    } catch (e: any) {
      setError(e.message ?? 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setConnection(null);
    disconnectWallet().catch(() => {});
  }, []);

  const sign = useCallback(
    async (xdr: string) => {
      if (!connection) throw new Error('Wallet not connected');
      return signTransaction(xdr);
    },
    [connection]
  );

  return (
    <WalletContext.Provider value={{ connection, isConnecting, error, connect, disconnect, sign }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
};
