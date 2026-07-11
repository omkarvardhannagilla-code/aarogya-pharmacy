'use client';
// My Orders — read entirely from this device's storage (localStorage via zustand persist).
// No login, no server call; survives tab close and restarts.
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useOrders, inr } from '../../lib/store';

const ICON = { approved: '✅', pending: '🟡', denied: '❌' };

export default function OrdersPage() {
  const { orders, clearOrders } = useOrders();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []); // avoid SSR/localStorage mismatch flash
  if (!hydrated) return <div className="p-10 text-center text-ink-soft">Loading your orders…</div>;

  if (!orders.length) return (
    <div className="mx-auto grid max-w-3xl place-items-center px-4 py-24 text-center">
      <div>
        <h1 className="font-display text-4xl font-bold text-ink">No orders yet</h1>
        <p className="mt-2 text-ink-soft">Orders you place on this device will appear here automatically — no account needed.</p>
        <Link href="/medicines" className="mt-6 inline-block rounded-full bg-pine px-8 py-3 font-semibold text-white hover:bg-pine-soft">Browse medicines</Link>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">My Orders</h1>
          <p className="text-sm text-ink-soft">Saved privately on this device · {orders.length} order{orders.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => confirm('Delete your order history from this device? This cannot be undone.') && clearOrders()}
          className="text-sm font-semibold text-berry hover:underline">Clear history</button>
      </div>
      <ul className="mt-6 space-y-4">
        {orders.map((o) => {
          const count = o.items.reduce((n, i) => n + i.qty, 0);
          return (
            <li key={o.orderId} className="rounded-3xl bg-white p-5 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold text-ink">{ICON[o.status] || '•'} {o.orderId}</p>
                <p className="text-sm text-ink-soft">{new Date(o.placedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <ul className="mt-3 divide-y divide-mint-line text-sm">
                {o.items.map((i) => (
                  <li key={i.id} className="flex justify-between py-1.5">
                    <span><Link href={`/product/${i.id}`} className="hover:text-pine">{i.name}</Link> ×{i.qty} {i.rx && <span className="text-[10px] font-bold text-amber-badge">℞</span>}</span>
                    <span className="font-semibold">{inr(i.price * i.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-mint-line pt-3 text-sm">
                <span className="text-ink-soft">📍 {o.address} · 🚚 {o.etaText}</span>
                <span className="font-bold text-pine">{inr(o.total)} · {count} item{count > 1 ? 's' : ''} · COD</span>
              </div>
              {o.status === 'pending' && <p className="mt-2 rounded-xl bg-amber-soft px-3 py-2 text-[12px] font-medium text-amber-badge">Awaiting final pharmacist confirmation.</p>}
            </li>
          );
        })}
      </ul>
      <p className="mt-6 rounded-2xl bg-mint-soft p-4 text-[13px] leading-relaxed text-ink-soft">🔒 This history lives only in your browser's storage — a couple of KB per order, no images — so even hundreds of orders use less space than a single photo. It stays after closing the tab or restarting your device; only clearing the browser's site data (or the button above) removes it.</p>
    </div>
  );
}
