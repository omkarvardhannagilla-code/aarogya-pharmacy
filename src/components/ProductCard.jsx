'use client';
import Link from 'next/link';
import MedicineBox from './MedicineBox';
import { RxBadge, StockBadge } from './Badges';
import { useCart, inr } from '../lib/store';

export default function ProductCard({ med, onQuickView }) {
  const add = useCart((s) => s.add);
  const out = med.stock === 'out-of-stock';
  return (
    <article className="group/card relative flex flex-col rounded-2xl bg-white p-4 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <Link href={`/product/${med.id}`} className="rounded-xl bg-mint-soft pb-2 pt-3" aria-label={med.name}>
        <MedicineBox med={med} size="md" />
      </Link>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link href={`/product/${med.id}`} className="line-clamp-1 font-semibold text-ink hover:text-pine">{med.name}</Link>
          <p className="line-clamp-1 text-[13px] text-ink-soft">{med.generic}</p>
          <p className="mt-0.5 text-[12px] text-ink-soft/80">{med.pack}</p>
        </div>
        {med.rx && <RxBadge />}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-lg font-bold text-pine">{inr(med.price)}</span>
        <span className="text-[13px] text-ink-soft line-through">{inr(med.mrp)}</span>
        <span className="text-[12px] font-bold text-berry">{med.discountPct}% off</span>
      </div>
      <div className="mt-1"><StockBadge stock={med.stock} /></div>
      <div className="mt-3 flex gap-2">
        <button
          disabled={out}
          onClick={() => add(med)}
          className="flex-1 rounded-full bg-pine px-4 py-2 text-sm font-semibold text-white transition hover:bg-pine-soft active:scale-[.98] disabled:cursor-not-allowed disabled:bg-ink-soft/30"
        >
          Add to cart
        </button>
        <button onClick={() => onQuickView?.(med)} className="rounded-full px-3 py-2 text-sm font-semibold text-pine hairline transition hover:bg-mint">
          Quick view
        </button>
      </div>
    </article>
  );
}
