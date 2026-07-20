/**
 * LinguaLayer — Stellar Wallets Kit Integration
 *
 * Uses @creit-tech/stellar-wallets-kit — the de-facto standard multi-wallet
 * library for Stellar that unifies ALL major wallets via a single interface.
 *
 * Supported wallets (no extra config required):
 *   - Freighter    (browser extension)
 *   - xBull        (browser extension + iOS/Android)
 *   - Lobstr       (browser extension + mobile)
 *   - Hana Wallet  (browser extension)
 *   - Rabet        (browser extension)
 *   - WalletConnect (mobile wallets via QR)
 *   - Ledger       (hardware wallet via USB/BLE)
 *   - ALBEDO       (web-based key manager)
 *   - HOT Wallet   (Telegram mini-app wallet)
 */

// Package types are declared in typings/stellar-wallets-kit.d.ts
// (the package was removed from npm; the .d.ts keeps TypeScript happy)
import {
  StellarWalletsKit,
  WalletNetwork,
  WalletType,
  allowAllModules,
  FREIGHTER_ID,
  XBULL_ID,
  LOBSTR_ID,
  HANA_ID,
  RABET_ID,
  ALBEDO_ID,
  WALLET_CONNECT_ID,
} from "@creit-tech/stellar-wallets-kit";

const NETWORK =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK === "mainnet"
    ? WalletNetwork.PUBLIC
    : WalletNetwork.TESTNET;

// Singleton kit instance
let _kit: StellarWalletsKit | null = null;

export function getWalletsKit(): StellarWalletsKit {
  if (_kit) return _kit;
  _kit = new StellarWalletsKit({
    network: NETWORK,
    selectedWalletId: FREIGHTER_ID,
    modules: allowAllModules(),
  });
  return _kit;
}


export interface WalletInfo {
  id: string;
  name: string;
  icon: string;
  isAvailable: boolean;
  type: "extension" | "hardware" | "mobile" | "web";
}

export async function detectWallets(): Promise<WalletInfo[]> {
  const kit = getWalletsKit();
  const supported = await kit.getSupportedWallets();
  return supported.map((w) => ({
    id: w.id,
    name: w.name,
    icon: w.icon,
    isAvailable: w.isAvailable ?? false,
    type: w.type ?? "extension",
  }));
}

export async function connectWallet(walletId: string): Promise<string> {
  const kit = getWalletsKit();
  await kit.setWallet(walletId);
  const { address } = await kit.getAddress();
  return address;
}

export async function signTransaction(
  xdr: string,
  walletId: string
): Promise<string> {
  const kit = getWalletsKit();
  await kit.setWallet(walletId);
  const { signedTxXdr } = await kit.signTransaction(xdr, {
    address: undefined, // kit resolves from connected wallet
    networkPassphrase:
      NETWORK === WalletNetwork.PUBLIC
        ? "Public Global Stellar Network ; September 2015"
        : "Test SDF Network ; September 2015",
  });
  return signedTxXdr;
}

export async function openWalletModal(): Promise<{ address: string; walletId: string }> {
  const kit = getWalletsKit();
  return new Promise((resolve, reject) => {
    kit.openModal({
      onWalletSelected: async (option) => {
        try {
          await kit.setWallet(option.id);
          const { address } = await kit.getAddress();
          resolve({ address, walletId: option.id });
        } catch (e) {
          reject(e);
        }
      },
      onClosed: () => reject(new Error("wallet modal closed")),
      modalTitle: "Connect your Stellar Wallet",
      notAvailableText: "Not installed — click to get it",
    });
  });
}

export { FREIGHTER_ID, XBULL_ID, LOBSTR_ID, HANA_ID, RABET_ID, ALBEDO_ID, WALLET_CONNECT_ID };
export type { WalletType };
