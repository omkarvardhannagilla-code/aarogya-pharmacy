'use client';
import Link from 'next/link';
import MedicineBox from './MedicineBox';
import { RxBadge, StockBadge } from './Badges';
import { useCart, inr } from '../lib/store';

export default function QuickView({ med, onClose }) {
  const add = useCart((s) => s.add);
  if (!med) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={`Quick view: ${med.name}`}>
      <button aria-label="Close quick view" className="absolute inset-0 bg-pine-deep/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl animate-pop rounded-3xl bg-white p-6 shadow-lift md:p-8">
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full hairline text-pine hover:bg-mint">✕</button>
        <div className="grid gap-6 md:grid-cols-[240px,1fr]">
          <div className="rounded-2xl bg-mint-soft py-6"><MedicineBox med={med} size="lg" /></div>
          <div>
            <div className="flex flex-wrap items-center gap-2">{med.rx && <RxBadge />}<StockBadge stock={med.stock} /></div>
            <h3 className="mt-2 font-display text-2xl text-pine">{med.name}</h3>
            <p className="text-ink-soft">{med.generic} · {med.pack}</p>
            <p className="text-[13px] text-ink-soft">by {med.manufacturer}</p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-pine">{inr(med.price)}</span>
              <span className="text-ink-soft line-through">{inr(med.mrp)}</span>
              <span className="text-sm font-bold text-berry">{med.discountPct}% off</span>
            </div>
            <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-ink-soft">{med.description}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button disabled={med.stock === 'out-of-stock'} onClick={() => { add(med); onClose(); }} className="rounded-full bg-pine px-6 py-2.5 font-semibold text-white transition hover:bg-pine-soft disabled:bg-ink-soft/30">Add to cart</button>
              <Link href={`/product/${med.id}`} className="rounded-full px-6 py-2.5 font-semibold text-pine hairline transition hover:bg-mint" onClick={onClose}>Full details</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
