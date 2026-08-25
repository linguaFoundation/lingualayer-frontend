/**
 * Shared license-type definitions, used by both the marketplace listing
 * (issue #2) and the dataset detail purchase flow (issue #3), so pricing
 * and labels can't drift between the two pages.
 */

export type LicenseTypeId = "research" | "nonprofit" | "commercial";

export interface LicenseTypeInfo {
  id: LicenseTypeId;
  label: string;
  /** USD price. 0 means free. */
  priceUsd: number;
}

export const LICENSE_TYPES: LicenseTypeInfo[] = [
  { id: "research", label: "Research", priceUsd: 0 },
  { id: "nonprofit", label: "NonProfit", priceUsd: 0.1 },
  { id: "commercial", label: "Commercial", priceUsd: 10 },
];

export function licenseLabel(id: LicenseTypeId): string {
  return LICENSE_TYPES.find((t) => t.id === id)?.label ?? id;
}

export function licensePrice(id: LicenseTypeId): number {
  return LICENSE_TYPES.find((t) => t.id === id)?.priceUsd ?? 0;
}

export interface DatasetLicenseOffer {
  type: LicenseTypeId;
  priceUsd: number;
}

/** The cheapest non-free offer, or 0 if every offer on the dataset is free. */
export function cheapestPaidPrice(offers: DatasetLicenseOffer[]): number {
  const paid = offers.map((o) => o.priceUsd).filter((p) => p > 0);
  return paid.length > 0 ? Math.min(...paid) : 0;
}

/** Converts royalty share basis points (0–10000) to a percentage string. */
export function basisPointsToPercent(bps: number): string {
  return `${(bps / 100).toFixed(bps % 100 === 0 ? 0 : 2)}%`;
}
