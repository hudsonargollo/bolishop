// Field rules shared by the sign-in / sign-up / reset forms (live feedback in the
// browser) and their server actions (the real check). Dependency-free so it can
// load anywhere, including standalone scripts.

/** Minimum length for customer passwords (register, checkout sign-up, reset). */
export const MIN_PASSWORD = 8;

// name@domain.tld — no spaces, one @, a dotted domain ending in 2+ letters.
export const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/i;

// Letters in any script (Urdu too) plus spaces, dots, apostrophes and hyphens;
// starts with a letter.
export const NAME_RE = /^\p{L}[\p{L}\p{M} .'-]*$/u;

export function emailError(value: string): string | null {
  const v = value.trim();
  if (!v) return "Please enter your email";
  if (v.length > 200 || !EMAIL_RE.test(v)) return "Enter a valid email, like name@example.com";
  return null;
}

export function nameError(value: string): string | null {
  const v = value.trim();
  if (!v) return "Please enter your name";
  if (v.length < 2) return "Name is too short";
  if (v.length > 120) return "Name is too long";
  if (!NAME_RE.test(v)) return "Use letters only (spaces, . ' - are fine)";
  return null;
}

/** The checklist shown under a new-password field. */
export function passwordRules(value: string) {
  return [
    { id: "length", label: `At least ${MIN_PASSWORD} characters`, ok: value.length >= MIN_PASSWORD },
    { id: "letter", label: "A letter", ok: /\p{L}/u.test(value) },
    { id: "number", label: "A number", ok: /\d/.test(value) },
  ];
}

export function newPasswordError(value: string): string | null {
  if (!value) return "Please choose a password";
  if (value.length > 200) return "Password is too long";
  const missing = passwordRules(value).find((r) => !r.ok);
  return missing ? `Password needs ${missing.label.toLowerCase()}` : null;
}

/** 0–4: drives the strength meter (rules met, plus a bonus for length / symbols). */
export function passwordStrength(value: string): number {
  if (!value) return 0;
  const met = passwordRules(value).filter((r) => r.ok).length;
  let score = met; // 0–3
  if (met === 3 && (value.length >= 12 || /[^\p{L}\d]/u.test(value))) score = 4;
  return score;
}
