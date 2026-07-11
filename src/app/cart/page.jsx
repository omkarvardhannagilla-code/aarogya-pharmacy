'use client';
import Link from 'next/link';
import { useCart, cartCount, cartTotal, cartMrpTotal, cartHasRx, inr } from '../../lib/store';
import MedicineBox from '../../components/MedicineBox';
import QtyStepper from '../../components/QtyStepper';
import { RxBadge } from '../../components/Badges';

export default function CartPage() {
  const { items, setQty, remove, clear } = useCart();
  const list = Object.values(items);
  const total = cartTotal(items); const mrp = cartMrpTotal(items); const hasRx = cartHasRx(items);
  if (list.length === 0) return (
    <div className="mx-auto grid max-w-3xl place-items-center px-4 py-24 text-center">
      <div>
        <h1 className="font-display text-4xl text-pine">Your cart is empty</h1>
        <p className="mt-2 text-ink-soft">Everything you add will appear here, synced with the AI assistant in Phase 3.</p>
        <Link href="/medicines" className="mt-6 inline-block rounded-full bg-pine px-8 py-3 font-semibold text-white hover:bg-pine-soft">Browse medicines</Link>
      </div>
    </div>
  );
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="flex items-end justify-between">
        <h1 className="font-display text-3xl text-pine">Cart · {cartCount(items)} items</h1>
        <button onClick={clear} className="text-sm font-semibold text-berry hover:underline">Clear cart</button>
      </div>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr,360px]">
        <ul className="space-y-3">
          {list.map((i) => (
            <li key={i.id} className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 shadow-card sm:flex-nowrap">
              <Link href={`/product/${i.id}`} className="w-24 shrink-0 rounded-xl bg-mint-soft"><MedicineBox med={i} size="sm" float={false} /></Link>
              <div className="min-w-0 flex-1">
                <Link href={`/product/${i.id}`} className="font-semibold hover:text-pine">{i.name}</Link>
                <p className="text-[13px] text-ink-soft">{i.generic} · {i.pack}</p>
                {i.rx && <div className="mt-1"><RxBadge /></div>}
              </div>
              <QtyStepper qty={i.qty} onChange={(q) => setQty(i.id, q)} />
              <div className="w-24 text-right">
                <p className="font-bold text-pine">{inr(i.price * i.qty)}</p>
                <p className="text-[12px] text-ink-soft line-through">{inr(i.mrp * i.qty)}</p>
              </div>
              <button onClick={() => remove(i.id)} aria-label={`Remove ${i.name}`} className="text-ink-soft transition hover:text-berry">✕</button>
            </li>
          ))}
        </ul>
        <aside className="h-fit rounded-3xl bg-white p-6 shadow-card lg:sticky lg:top-20">
          <h2 className="font-display text-xl text-pine">Order summary</h2>
          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-ink-soft">MRP total</dt><dd className="line-through">{inr(mrp)}</dd></div>
            <div className="flex justify-between font-semibold text-pine"><dt>Savings</dt><dd>−{inr(mrp - total)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-soft">Delivery</dt><dd className="font-semibold text-pine">Free</dd></div>
            <div className="mt-2 flex justify-between border-t border-mint-line pt-2 text-lg font-bold"><dt>To pay</dt><dd className="text-pine">{inr(total)}</dd></div>
          </dl>
          {hasRx && <p className="mt-3 rounded-xl bg-amber-soft p-3 text-[13px] font-medium leading-relaxed text-amber-badge">Your cart contains ℞ medicines. The AI assistant will verify your prescription during checkout.</p>}
          <p className="mt-3 rounded-xl bg-mint-soft p-3 text-[13px] leading-relaxed text-ink-soft">Delivery within <span className="font-semibold text-ink">Telangana only</span> · Cash on delivery or UPI at the door.</p>
          <button onClick={() => window.dispatchEvent(new CustomEvent('open-assistant-order'))} className="mt-4 w-full rounded-full bg-pine py-3 font-semibold text-white transition hover:bg-pine-soft">
            Proceed to AI checkout →
          </button>
          <Link href="/medicines" className="mt-2 block rounded-full py-3 text-center font-semibold text-pine hairline hover:bg-mint">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
