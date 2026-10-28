/**
 * Iranian identifier validators and normalizers:
 * National ID (کد ملی), Mobile number, Card number, IBAN (شبا)
 */

export function normalizeDigits(s: string): string {
  if (!s) return "";
  return s
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0)) // Persian ۰–۹
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)) // Arabic-Indic ٠–٩
    .replace(/[\s‌_-]/g, "");
}

/** National ID (کد ملی) checksum validator */
export function isNationalId(input: string): boolean {
  const s = normalizeDigits(input);
  if (!/^\d{10}$/.test(s) || /^(\d)\1{9}$/.test(s)) return false;
  const check = Number(s[9]);
  const sum = [...s.slice(0, 9)].reduce((acc, d, i) => acc + Number(d) * (10 - i), 0);
  const r = sum % 11;
  return r < 2 ? check === r : check === 11 - r;
}

/** Iranian mobile number validator (starts with 09 and 11 digits) */
export function isMobilePhone(input: string): boolean {
  const s = normalizeDigits(input);
  return /^09\d{9}$/.test(s);
}

/** Bank card Luhn check */
export function isCardNumber(input: string): boolean {
  const s = normalizeDigits(input);
  if (!/^\d{16}$/.test(s)) return false;
  let sum = 0;
  for (let i = 0; i < 16; i++) {
    let d = Number(s[i]);
    if (i % 2 === 0) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}
