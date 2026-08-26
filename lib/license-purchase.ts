/**
 * License purchase API calls for the dataset detail page (issue #3).
 *
 * Kept as its own small module rather than merged into a shared licensing
 * lib, deliberately: the marketplace listing page (issue #2) also needs a
 * license-type vocabulary, and giving each feature its own self-contained
 * module avoids the two PRs racing to create the same shared file — a
 * follow-up can consolidate once both have landed.
 */

export type LicenseTypeId = "research" | "nonprofit" | "commercial";

export interface LicenseOption {
  id: LicenseTypeId;
  label: string;
  priceUsd: number;
}

export const LICENSE_OPTIONS: LicenseOption[] = [
  { id: "research", label: "Research", priceUsd: 0 },
  { id: "nonprofit", label: "NonProfit", priceUsd: 0.1 },
  { id: "commercial", label: "Commercial", priceUsd: 10 },
];

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

export interface PrepareLicenseResponse {
  xdr: string;
}

export interface SubmitLicenseResponse {
  hash: string;
  license_id: string;
  expires_at?: string;
}

/** Step 2 of the purchase flow: ask the backend for an unsigned XDR envelope. */
export async function prepareLicensePurchase(
  datasetId: string,
  licenseType: LicenseTypeId,
  buyerAddress: string,
): Promise<PrepareLicenseResponse> {
  const res = await fetch(`${API}/tx/prepare/issue-license`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      dataset_id: datasetId,
      license_type: licenseType,
      buyer_address: buyerAddress,
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to prepare the license transaction (HTTP ${res.status}).`);
  }
  return res.json();
}

/** Step 4 of the purchase flow: submit the wallet-signed XDR. */
export async function submitLicenseTransaction(signedXdr: string): Promise<SubmitLicenseResponse> {
  const res = await fetch(`${API}/tx/submit`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ xdr: signedXdr }),
  });
  if (!res.ok) {
    throw new Error(`Failed to submit the signed transaction (HTTP ${res.status}).`);
  }
  return res.json();
}

/** Maps a thrown error (including a Freighter/wallet rejection) to copy safe to show the user. */
export function purchaseErrorMessage(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  if (/reject|declin|cancel|denied/i.test(message)) {
    return "You declined the transaction in your wallet.";
  }
  return message || "License purchase failed. Please try again.";
}
