// Money is in PKR. Clean, no-decimal display for a luxury feel: "Rs 48,000".
const pkr = new Intl.NumberFormat("en-PK", {
  maximumFractionDigits: 0,
});

export function formatPrice(amount: number): string {
  return `Rs ${pkr.format(Math.round(amount))}`;
}

export function discountPercent(price: number, compareAt: number | null): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}
