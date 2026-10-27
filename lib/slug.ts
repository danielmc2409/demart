// lib/slug.ts
export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// aceita "59,90", "1.299,90" e "59.90"
export function parsePreco(v: string) {
  const limpo = v.includes(",") ? v.replace(/\./g, "").replace(",", ".") : v;
  const n = Number(limpo.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
}