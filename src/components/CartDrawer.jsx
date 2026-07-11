'use client';
import Link from 'next/link';
import { useCart, cartCount, cartTotal, cartMrpTotal, cartHasRx, inr } from '../lib/store';
import MedicineBox from './MedicineBox';
import QtyStepper from './QtyStepper';

export default function CartDrawer() {
  const { items, drawerOpen, closeDrawer, setQty, remove } = useCart();
  const list = Object.values(items);
  if (!drawerOpen) return null;
  const total = cartTotal(items); const mrp = cartMrpTotal(items);
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <button aria-label="Close cart" className="absolute inset-0 bg-pine-deep/45 backdrop-blur-[2px]" onClick={closeDrawer} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md animate-slideIn flex-col bg-paper shadow-drawer">
        <header className="flex items-center justify-between border-b border-mint-line px-5 py-4">
          <h2 className="font-display text-xl text-pine">Your cart · {cartCount(items)}</h2>
          <button onClick={closeDrawer} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full hairline text-pine hover:bg-mint">✕</button>
        </header>
        {list.length === 0 ? (
          <div className="grid flex-1 place-items-center p-8 text-center">
            <div>
              <p className="font-display text-2xl text-pine">Your cart is empty</p>
              <p className="mt-1 text-ink-soft">Browse 500+ authentic medicines to get started.</p>
              <Link href="/medicines" onClick={closeDrawer} className="mt-4 inline-block rounded-full bg-pine px-6 py-2.5 font-semibold text-white hover:bg-pine-soft">Shop medicines</Link>
            </div>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {list.map((i) => (
                <li key={i.id} className="flex gap-3 rounded-2xl bg-white p-3 shadow-card">
                  <div className="w-20 shrink-0 rounded-xl bg-mint-soft"><MedicineBox med={i} size="sm" float={false} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{i.name}</p>
                    <p className="truncate text-[12px] text-ink-soft">{i.pack}</p>
                    {i.rx && <p className="text-[11px] font-bold text-amber-badge">℞ needs prescription</p>}
                    <div className="mt-2 flex items-center justify-between">
                      <QtyStepper size="sm" qty={i.qty} onChange={(q) => setQty(i.id, q)} />
                      <span className="font-bold text-pine">{inr(i.price * i.qty)}</span>
                    </div>
                  </div>
                  <button onClick={() => remove(i.id)} aria-label={`Remove ${i.name}`} className="self-start text-ink-soft hover:text-berry">✕</button>
                </li>
              ))}
            </ul>
            <footer className="border-t border-mint-line bg-white px-5 py-4">
              <div className="flex justify-between text-sm text-ink-soft"><span>MRP total</span><span className="line-through">{inr(mrp)}</span></div>
              <div className="flex justify-between text-sm font-semibold text-pine"><span>You save</span><span>{inr(mrp - total)}</span></div>
              <div className="mt-1 flex justify-between text-lg font-bold"><span>Subtotal</span><span className="text-pine">{inr(total)}</span></div>
              {cartHasRx(items) && <p className="mt-2 rounded-xl bg-amber-soft px-3 py-2 text-[12px] font-medium text-amber-badge">Some items need a valid prescription — our AI assistant will verify it at checkout.</p>}
              <Link href="/cart" onClick={closeDrawer} className="mt-3 block rounded-full bg-pine py-3 text-center font-semibold text-white transition hover:bg-pine-soft">Review cart & checkout</Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
