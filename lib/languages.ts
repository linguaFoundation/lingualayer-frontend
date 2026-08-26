/**
 * ISO 639-3 language directory for the datasets marketplace (issue #2).
 * Names and family groupings for the African languages this platform
 * targets — deliberately not exhaustive, just enough for the language
 * filter to show a real name and family instead of a bare code.
 */

export type LanguageFamily =
  | "Niger-Congo"
  | "Afro-Asiatic"
  | "Nilo-Saharan"
  | "Austronesian"
  | "Other";

export const LANGUAGE_FAMILIES: LanguageFamily[] = [
  "Niger-Congo",
  "Afro-Asiatic",
  "Nilo-Saharan",
  "Austronesian",
  "Other",
];

export interface LanguageInfo {
  /** ISO 639-3 code. */
  code: string;
  name: string;
  family: LanguageFamily;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: "yor", name: "Yoruba", family: "Niger-Congo" },
  { code: "hau", name: "Hausa", family: "Afro-Asiatic" },
  { code: "ibo", name: "Igbo", family: "Niger-Congo" },
  { code: "swa", name: "Swahili", family: "Niger-Congo" },
  { code: "amh", name: "Amharic", family: "Afro-Asiatic" },
  { code: "zul", name: "Zulu", family: "Niger-Congo" },
  { code: "xho", name: "Xhosa", family: "Niger-Congo" },
  { code: "som", name: "Somali", family: "Afro-Asiatic" },
  { code: "orm", name: "Oromo", family: "Afro-Asiatic" },
  { code: "ful", name: "Fula", family: "Niger-Congo" },
  { code: "lin", name: "Lingala", family: "Niger-Congo" },
  { code: "wol", name: "Wolof", family: "Niger-Congo" },
  { code: "twi", name: "Twi", family: "Niger-Congo" },
  { code: "kin", name: "Kinyarwanda", family: "Niger-Congo" },
  { code: "lug", name: "Luganda", family: "Niger-Congo" },
  { code: "luo", name: "Luo", family: "Nilo-Saharan" },
  { code: "kau", name: "Kanuri", family: "Nilo-Saharan" },
  { code: "mlg", name: "Malagasy", family: "Austronesian" },
];

const BY_CODE = new Map(LANGUAGES.map((l) => [l.code, l]));

export function languageName(code: string): string {
  return BY_CODE.get(code)?.name ?? code.toUpperCase();
}

export function languageFamily(code: string): LanguageFamily {
  return BY_CODE.get(code)?.family ?? "Other";
}
