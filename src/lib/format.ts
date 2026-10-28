// Money is in PKR. Clean, no-decimal display for a luxury feel: "Rs 48,000".
const pkr = new Intl.NumberFormat("en-PK", {
  maximumFractionDigits: 0,
});

export function formatPrice(amount: number, currency = "PKR"): string {
  if (currency === "PKR") return `Rs ${pkr.format(Math.round(amount))}`;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
  } catch {
    return `${currency} ${Math.round(amount)}`;
  }
}

export function discountPercent(price: number, compareAt: number | null | undefined): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

/** Rupees saved per piece vs the compare-at price, or null when not on sale. */
export function savingsOf(price: number, compareAt: number | null | undefined): number | null {
  if (!compareAt || compareAt <= price) return null;
  return compareAt - price;
}
