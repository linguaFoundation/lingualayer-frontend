/**
 * Type stub for @creit-tech/stellar-wallets-kit
 *
 * This package was removed from the npm registry. The declarations below
 * provide the minimal types needed for the codebase to compile. Remove this
 * file once the team migrates to an available alternative.
 */
declare module "@creit-tech/stellar-wallets-kit" {
  export interface WalletOption {
    id: string;
    name: string;
    icon: string;
    isAvailable?: boolean;
    type?: "extension" | "hardware" | "mobile" | "web";
  }

  export interface SignResult {
    signedTxXdr: string;
  }

  export interface AddressResult {
    address: string;
  }

  export interface StellarWalletsKit {
    setWallet(id: string): Promise<void>;
    getAddress(): Promise<AddressResult>;
    signTransaction(
      xdr: string,
      opts: { address?: string; networkPassphrase: string }
    ): Promise<SignResult>;
    getSupportedWallets(): Promise<WalletOption[]>;
    openModal(opts: {
      onWalletSelected: (option: WalletOption) => void;
      onClosed: () => void;
      modalTitle?: string;
      notAvailableText?: string;
    }): void;
  }

  export const StellarWalletsKit: new (opts: {
    network: string;
    selectedWalletId: string;
    modules: unknown[];
  }) => StellarWalletsKit;

  export type WalletType = string;

  export const WalletNetwork: {
    readonly PUBLIC: "Public Global Stellar Network ; September 2015";
    readonly TESTNET: "Test SDF Network ; September 2015";
  };

  export function allowAllModules(): unknown[];

  export const FREIGHTER_ID: string;
  export const XBULL_ID: string;
  export const LOBSTR_ID: string;
  export const HANA_ID: string;
  export const RABET_ID: string;
  export const ALBEDO_ID: string;
  export const WALLET_CONNECT_ID: string;
}
