/**
 * Iranian-specific validation and formatting: mobile numbers, شبا (IBAN), کد ملی,
 * bank cards (with BIN → bank), and car plates (پلاک).
 * Dependency-free; accepts Persian or Latin digits everywhere.
 */
import { en, fa } from "./utils";

/* ---------- mobile ---------- */

/** Normalizes «۰۹۱۲…», «+98912…», «0098912…» to the 10-digit form «912…». */
export function normalizeIranMobile(input: string): string {
  let d = en(input).replace(/\D/g, "");
  if (d.startsWith("0098")) d = d.slice(4);
  else if (d.startsWith("98") && d.length > 10) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  return d.slice(0, 10);
}

export function isIranMobile(input: string): boolean {
  return /^9\d{9}$/.test(normalizeIranMobile(input));
}

/** «912 345 6789» — three groups, always LTR. */
export function formatIranMobile(input: string): string {
  const d = normalizeIranMobile(input);
  return [d.slice(0, 3), d.slice(3, 6), d.slice(6, 10)].filter(Boolean).join(" ");
}

const OPERATORS: [RegExp, string][] = [
  [/^(91\d|99[0-6])/, "همراه اول"],
  [/^(93[0-9]|90[1-5])/, "ایرانسل"],
  [/^92[0-2]/, "رایتل"],
  [/^998/, "شاتل موبایل"],
  [/^999/, "سامانتل"],
];

export function mobileOperator(input: string): string | null {
  const d = normalizeIranMobile(input);
  if (d.length < 3) return null;
  return OPERATORS.find(([re]) => re.test(d))?.[1] ?? null;
}

/* ---------- کد ملی ---------- */

/** Digits only (Persian accepted), capped at 10. Keep it a string: codes may start with 0. */
export function normalizeNationalId(input: string): string {
  return en(input).replace(/\D/g, "").slice(0, 10);
}

/** «۰۰۱-۲۳۴۵۶۷-۸» — the 3-6-1 grouping printed on the card. */
export function formatNationalId(input: string): string {
  const d = normalizeNationalId(input);
  return fa([d.slice(0, 3), d.slice(3, 9), d.slice(9, 10)].filter(Boolean).join("-"));
}

export function isNationalId(input: string): boolean {
  const d = en(input).replace(/\D/g, "");
  if (!/^\d{10}$/.test(d) || /^(\d)\1{9}$/.test(d)) return false;
  const check = Number(d[9]);
  const sum = d.slice(0, 9).split("").reduce((s, ch, i) => s + Number(ch) * (10 - i), 0);
  const r = sum % 11;
  return r < 2 ? check === r : check === 11 - r;
}

/* ---------- card ---------- */

/** 16 Latin digits at most; Persian digits, spaces and dashes are stripped. */
export function normalizeCardNumber(input: string): string {
  return en(input).replace(/\D/g, "").slice(0, 16);
}

/** «۶۰۳۷ ۹۹۱۱ ۲۲۳۳ ۴۴۵۵» — Persian digits, four groups. */
export function formatCardNumber(input: string): string {
  const d = normalizeCardNumber(input);
  return fa(d.replace(/(.{4})/g, "$1 ").trim());
}

/** First six digits (BIN / پیش‌شماره) of Iranian bank cards. */
const CARD_BINS: Record<string, string> = {
  "603799": "ملی", "589210": "سپه", "627381": "سپه", "639599": "سپه", "636949": "سپه", "639370": "سپه", "505801": "سپه",
  "627648": "توسعه صادرات", "207177": "توسعه صادرات", "627961": "صنعت و معدن", "603770": "کشاورزی", "639217": "کشاورزی",
  "628023": "مسکن", "627760": "پست بانک", "502908": "توسعه تعاون", "627412": "اقتصاد نوین", "622106": "پارسیان", "639194": "پارسیان",
  "627884": "پارسیان", "502229": "پاسارگاد", "639347": "پاسارگاد", "627488": "کارآفرین", "502910": "کارآفرین", "621986": "سامان",
  "639346": "سینا", "639607": "سرمایه", "636214": "آینده", "502806": "شهر", "504706": "شهر", "502938": "دی", "603769": "صادرات",
  "610433": "ملت", "991975": "ملت", "627353": "تجارت", "585983": "تجارت", "589463": "رفاه کارگران", "504172": "رسالت",
  "606373": "قرض‌الحسنه مهر ایران", "628157": "مؤسسه توسعه", "505785": "ایران زمین", "505416": "گردشگری", "606256": "مؤسسه ملل",
  "585947": "خاورمیانه", "581874": "ایران‌ونزوئلا", "636795": "بانک مرکزی", "507677": "مؤسسه نور",
};

export function cardBank(input: string): string | null {
  const d = normalizeCardNumber(input);
  if (d.length < 6) return null;
  return CARD_BINS[d.slice(0, 6)] ?? null;
}

export function isCardNumber(input: string): boolean {
  const d = normalizeCardNumber(input);
  if (d.length !== 16) return false;
  let sum = 0;
  for (let i = 0; i < 16; i++) {
    let n = Number(d[i]);
    if (i % 2 === 0) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
  }
  return sum % 10 === 0;
}
