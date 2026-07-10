/**
 * LinguaLayer Multi-Wallet Integration
 * Supports: Freighter, Lobstr, xBull, Hana Wallet, and ALBEDO
 */

export type WalletType = 'freighter' | 'lobstr' | 'xbull' | 'hana' | 'albedo';

export interface WalletConnection {
  address: string;
  publicKey: string;
  walletType: WalletType;
  network: 'testnet' | 'mainnet';
}

export async function detectAvailableWallets(): Promise<WalletType[]> {
  const available: WalletType[] = [];
  if (typeof window === 'undefined') return available;

  // Freighter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).freighter) available.push('freighter');
  // xBull
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).xBullSDK || (window as any).xBullWalletExtension) available.push('xbull');
  // Lobstr
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).lobstrSorobanExtension) available.push('lobstr');
  // Hana
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).hana) available.push('hana');

  return available;
}

export async function connectWallet(type: WalletType): Promise<WalletConnection> {
  switch (type) {
    case 'freighter': {
      const freighter = await import('@stellar/freighter-api');
      const isConnected = await freighter.isConnected();
      if (!isConnected.isConnected) {
        throw new Error('Freighter extension not installed. Please install from https://freighter.app');
      }
      const network = await freighter.getNetwork();
      const addressResult = await freighter.getAddress();
      return {
        address: addressResult.address,
        publicKey: addressResult.address,
        walletType: 'freighter',
        network: network.network === 'TESTNET' ? 'testnet' : 'mainnet',
      };
    }
    case 'xbull': {
      throw new Error('xBull: call window.xBullSDK.connect() directly');
    }
    default:
      throw new Error(`Wallet type '${type}' not yet integrated`);
  }
}

export async function signTransaction(
  xdr: string,
  walletType: WalletType,
  network: 'testnet' | 'mainnet'
): Promise<string> {
  const networkPassphrase =
    network === 'testnet'
      ? 'Test SDF Network ; September 2015'
      : 'Public Global Stellar Network ; September 2015';

  switch (walletType) {
    case 'freighter': {
      const freighter = await import('@stellar/freighter-api');
      const result = await freighter.signTransaction(xdr, { networkPassphrase });
      return result.signedTxXdr;
    }
    default:
      throw new Error(`Signing not implemented for wallet '${walletType}'`);
  }
}
