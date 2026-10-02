const MONEY_PATTERN = /^(-)?(\d+)(?:\.(\d{1,2}))?$/;

export function toCents(amount: string): bigint {
  const match = MONEY_PATTERN.exec(amount.trim());

  if (!match) {
    throw new Error(`Invalid money amount: ${amount}`);
  }

  const [, sign, whole, fraction = ""] = match;
  const cents = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
  return sign ? -cents : cents;
}

export function fromCents(cents: bigint): string {
  const sign = cents < 0n ? "-" : "";
  const absolute = cents < 0n ? -cents : cents;
  const fraction = (absolute % 100n).toString().padStart(2, "0");
  return `${sign}${absolute / 100n}.${fraction}`;
}

export function proposalTotal({ subtotal, discount, tax }: { subtotal: string; discount: string; tax: string }): string {
  return fromCents(toCents(subtotal) - toCents(discount) + toCents(tax));
}

export function isZeroAmount(amount: string): boolean {
  return toCents(amount) === 0n;
}
