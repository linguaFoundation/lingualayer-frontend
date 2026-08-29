/**
 * Account balance lookups (issue #1: wallet balance in XLM and USDC).
 *
 * Reads directly from Horizon's `/accounts/{id}` endpoint rather than a
 * Soroban RPC call — balances (native XLM and classic-asset trustlines,
 * which is how USDC is held on Stellar) are exactly what that endpoint
 * already returns, with no need to simulate a contract invocation for data
 * the network keeps on the account itself.
 */

import { defaultHorizonUrl } from "./tx-status";

export interface AccountBalances {
  xlm: number;
  /** null when the account has no USDC trustline (not "zero balance"). */
  usdc: number | null;
}

interface HorizonBalanceLine {
  asset_type: string;
  asset_code?: string;
  balance: string;
}

interface HorizonAccountResponse {
  balances: HorizonBalanceLine[];
}

const UNFUNDED_BALANCES: AccountBalances = { xlm: 0, usdc: null };

/**
 * Fetches an account's native XLM balance and USDC trustline balance (if
 * any). An account that has never been funded (404 from Horizon) is not an
 * error — it simply has nothing yet.
 */
export async function fetchAccountBalances(address: string): Promise<AccountBalances> {
  const horizonUrl = defaultHorizonUrl().replace(/\/+$/, "");
  const res = await fetch(`${horizonUrl}/accounts/${encodeURIComponent(address)}`);

  if (res.status === 404) return UNFUNDED_BALANCES;
  if (!res.ok) {
    throw new Error(`Horizon responded ${res.status} ${res.statusText}`);
  }

  const account: HorizonAccountResponse = await res.json();
  const native = account.balances.find((b) => b.asset_type === "native");
  const usdc = account.balances.find((b) => b.asset_code === "USDC");

  return {
    xlm: native ? parseFloat(native.balance) : 0,
    usdc: usdc ? parseFloat(usdc.balance) : null,
  };
}
