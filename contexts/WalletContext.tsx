'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { WalletConnection, WalletType } from '@/lib/wallet';
import { connectWallet, signTransaction } from '@/lib/wallet';

interface WalletContextType {
  connection: WalletConnection | null;
  isConnecting: boolean;
  error: string | null;
  connect: (type: WalletType) => Promise<void>;
  disconnect: () => void;
  sign: (xdr: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [connection, setConnection] = useState<WalletConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async (type: WalletType) => {
    setIsConnecting(true);
    setError(null);
    try {
      const conn = await connectWallet(type);
      setConnection(conn);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => setConnection(null), []);

  const sign = useCallback(async (xdr: string) => {
    if (!connection) throw new Error('Wallet not connected');
    return signTransaction(xdr, connection.walletType, connection.network);
  }, [connection]);

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
