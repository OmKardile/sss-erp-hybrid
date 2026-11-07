/** Indian-locale rupee formatting without Intl dependency (Hermes-safe). */

function groupIndian(n: number): string {
  const neg = n < 0;
  const abs = Math.abs(n);
  const [intPart, decPart] = abs.toFixed(2).split(".");
  let grouped: string;
  if (intPart.length <= 3) {
    grouped = intPart;
  } else {
    const last3 = intPart.slice(-3);
    const rest = intPart.slice(0, -3);
    grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3;
  }
  const hasDec = Number(decPart) !== 0;
  return `${neg ? "-" : ""}${grouped}${hasDec ? "." + decPart : ""}`;
}

/** "₹1,234" — whole rupees (grocery prices are integral). */
export function rupees(n: number): string {
  const rounded = Math.round(n);
  return `₹${groupIndian(rounded)}`;
}

/** "₹1,234.50" — when paise matter (totals after % discounts). */
export function rupeesExact(n: number): string {
  return `₹${groupIndian(n)}`;
}
