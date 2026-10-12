export function formatQuantity(quantity: string) {
  return quantity.replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}
