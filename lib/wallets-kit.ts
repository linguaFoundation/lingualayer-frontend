/**
 * LinguaLayer — Stellar Wallets Kit Integration
 *
 * Uses @creit.tech/stellar-wallets-kit — the de-facto standard multi-wallet
 * library for Stellar that unifies wallets via a single interface.
 *
 * Wallets registered below (no extra account/config required):
 *   - Freighter    (browser extension)
 *   - xBull        (browser extension + iOS/Android)
 *   - Lobstr       (browser extension + mobile)
 *   - Hana Wallet  (browser extension)
 *   - Rabet        (browser extension)
 *   - ALBEDO       (web-based key manager)
 *
 * WalletConnect and Ledger are supported by the underlying kit but are left
 * out of this default module list: WalletConnect needs a Reown/WalletConnect
 * project id to be provisioned, and Ledger is a hardware-wallet flow with
 * its own UX considerations — both are out of scope for this migration.
 *
 * SSR safety: the kit package reads `localStorage` as a side effect of its
 * own module initialization (not just when its APIs are called), so it
 * cannot be imported at module scope here — that alone crashes `next build`
 * while prerendering pages that pull this file in via the wallet context,
 * even ones that never touch a wallet. Every kit import below is therefore
 * a dynamic `import()` inside `ensureInit()`, which only ever runs from a
 * browser event handler / effect, never during a server render.
 */

import type {
  StellarWalletsKit as StellarWalletsKitType,
  Networks as NetworksType,
  ISupportedWallet,
} from "@creit.tech/stellar-wallets-kit";

export const FREIGHTER_ID = "freighter";
export const XBULL_ID = "xbull";
export const LOBSTR_ID = "lobstr";
export const HANA_ID = "hana";
export const RABET_ID = "rabet";
export const ALBEDO_ID = "albedo";

const WALLET_ID_STORAGE_KEY = "linguaLayer:walletId";

let kitPromise: Promise<{ Kit: typeof StellarWalletsKitType; network: NetworksType }> | null = null;

/**
 * Lazily loads and initializes the kit's static state. Safe to call
 * repeatedly — the underlying dynamic import + init only happens once.
 */
function loadKit() {
  if (!kitPromise) {
    kitPromise = (async () => {
      const [{ StellarWalletsKit, Networks }, { FreighterModule }, { xBullModule }, { LobstrModule }, { HanaModule }, { RabetModule }, { AlbedoModule }] =
        await Promise.all([
          import("@creit.tech/stellar-wallets-kit"),
          import("@creit.tech/stellar-wallets-kit/modules/freighter"),
          import("@creit.tech/stellar-wallets-kit/modules/xbull"),
          import("@creit.tech/stellar-wallets-kit/modules/lobstr"),
          import("@creit.tech/stellar-wallets-kit/modules/hana"),
          import("@creit.tech/stellar-wallets-kit/modules/rabet"),
          import("@creit.tech/stellar-wallets-kit/modules/albedo"),
        ]);

      const network =
        process.env.NEXT_PUBLIC_STELLAR_NETWORK === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;

      StellarWalletsKit.init({
        network,
        modules: [
          new FreighterModule(),
          new xBullModule(),
          new LobstrModule(),
          new HanaModule(),
          new RabetModule(),
          new AlbedoModule(),
        ],
      });

      return { Kit: StellarWalletsKit, network };
    })();
  }
  return kitPromise;
}

export interface WalletInfo {
  id: string;
  name: string;
  icon: string;
  isAvailable: boolean;
  type: string;
}

export async function detectWallets(): Promise<WalletInfo[]> {
  const { Kit } = await loadKit();
  const supported: ISupportedWallet[] = await Kit.refreshSupportedWallets();
  return supported.map((w) => ({
    id: w.id,
    name: w.name,
    icon: w.icon,
    isAvailable: w.isAvailable,
    type: w.type,
  }));
}

/** Persists `walletId` so a returning user can be auto-reconnected. */
function persistWalletId(walletId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WALLET_ID_STORAGE_KEY, walletId);
}

export function getPersistedWalletId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(WALLET_ID_STORAGE_KEY);
}

export function clearPersistedWalletId(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(WALLET_ID_STORAGE_KEY);
}

/** Connects directly to a known wallet id, without showing the picker UI. */
export async function connectWallet(walletId: string): Promise<string> {
  const { Kit } = await loadKit();
  Kit.setWallet(walletId);
  const { address } = await Kit.fetchAddress();
  persistWalletId(walletId);
  return address;
}

/**
 * Signs `xdr` with the currently-active wallet, or with `walletId` if given
 * (switching the kit's active wallet to it first).
 */
export async function signTransaction(xdr: string, walletId?: string): Promise<string> {
  const { Kit, network } = await loadKit();
  if (walletId) {
    Kit.setWallet(walletId);
  }
  const { signedTxXdr } = await Kit.signTransaction(xdr, { networkPassphrase: network });
  return signedTxXdr;
}

/**
 * Opens the kit's built-in wallet-selector modal and resolves once the user
 * has picked a wallet and its address has been fetched.
 */
export async function openWalletModal(): Promise<{ address: string; walletId: string }> {
  const { Kit } = await loadKit();
  const { KitEventType } = await import("@creit.tech/stellar-wallets-kit");

  let selectedId: string | undefined;
  const unsubscribe = Kit.on(KitEventType.WALLET_SELECTED, (event) => {
    selectedId = event.payload.id;
  });

  try {
    const { address } = await Kit.authModal();
    const walletId = selectedId ?? Kit.selectedModule.productId;
    persistWalletId(walletId);
    return { address, walletId };
  } finally {
    unsubscribe();
  }
}

export async function disconnectWallet(): Promise<void> {
  const { Kit } = await loadKit();
  clearPersistedWalletId();
  return Kit.disconnect();
}
