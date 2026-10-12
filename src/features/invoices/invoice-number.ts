export function formatInvoiceNumber(sequence: number) {
  return `INV-${sequence < 10_000 ? String(sequence).padStart(4, "0") : sequence}`;
}
