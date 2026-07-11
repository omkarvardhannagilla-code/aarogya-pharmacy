export function RxBadge() {
  return <span className="inline-flex items-center gap-1 rounded-full bg-amber-soft px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-badge">℞ Prescription</span>;
}
export function StockBadge({ stock }) {
  if (stock === 'in-stock') return <span className="text-[12px] font-semibold text-pine">In stock</span>;
  if (stock === 'low-stock') return <span className="text-[12px] font-semibold text-amber-badge">Only a few left</span>;
  return <span className="text-[12px] font-semibold text-berry">Out of stock</span>;
}
