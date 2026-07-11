'use client';
import { useState } from 'react';
import Link from 'next/link';
import MedicineBox from '../../../components/MedicineBox';
import ProductCard from '../../../components/ProductCard';
import QuickView from '../../../components/QuickView';
import QtyStepper from '../../../components/QtyStepper';
import { RxBadge, StockBadge } from '../../../components/Badges';
import { useCart, inr } from '../../../lib/store';

function Section({ title, children }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-card">
      <h2 className="font-display text-xl text-pine">{title}</h2>
      <div className="mt-2 text-[15px] leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}

export default function ProductDetail({ med, related }) {
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [qv, setQv] = useState(null);
  const out = med.stock === 'out-of-stock';
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <nav className="text-sm text-ink-soft" aria-label="Breadcrumb">
        <Link href="/medicines" className="hover:text-pine">Medicines</Link> / <Link href={`/medicines?cat=${med.category}`} className="hover:text-pine">{med.categoryLabel}</Link> / <span className="text-ink">{med.name}</span>
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-[420px,1fr]">
        <div className="h-fit rounded-3xl bg-mint-soft py-10 lg:sticky lg:top-20">
          <MedicineBox med={med} size="lg" />
          <p className="mt-4 text-center text-[12px] text-ink-soft">Representative pack visual · actual packaging may vary</p>
        </div>

        <div className="animate-fadeUp space-y-4">
          <div className="flex flex-wrap items-center gap-2">{med.rx && <RxBadge />}<StockBadge stock={med.stock} /></div>
          <div>
            <h1 className="font-display text-3xl text-pine md:text-4xl">{med.name}</h1>
            <p className="mt-1 text-lg text-ink-soft">{med.generic}</p>
            <p className="text-sm text-ink-soft">Brand <span className="font-semibold text-ink">{med.brand}</span> · by <span className="font-semibold text-ink">{med.manufacturer}</span> · {med.pack}</p>
            <p className="text-sm text-ink-soft">★ {med.rating} ({med.reviews.toLocaleString('en-IN')} ratings) · {med.form}</p>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-pine">{inr(med.price)}</span>
            <span className="text-lg text-ink-soft line-through">{inr(med.mrp)}</span>
            <span className="font-bold text-berry">{med.discountPct}% off</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <QtyStepper qty={qty} onChange={(n) => setQty(Math.max(1, Math.min(10, n)))} />
            <button disabled={out} onClick={() => add(med, qty)} className="rounded-full bg-pine px-8 py-3 font-semibold text-white transition hover:bg-pine-soft active:scale-[.98] disabled:bg-ink-soft/30">
              {out ? 'Out of stock' : `Add ${qty} to cart · ${inr(med.price * qty)}`}
            </button>
          </div>
          <div className="grid gap-2 rounded-2xl bg-white p-4 text-sm shadow-card sm:grid-cols-2">
            <p>🚚 Delivery in <span className="font-semibold">{med.deliveryDays === 1 ? '24 hours' : '1–2 days'}</span> across Telangana</p>
            <p>💵 Cash on delivery · UPI at the door</p>
            <p>📦 Mfg {med.mfgDate} · Expiry {med.expDate}</p>
            <p>{med.rx ? '℞ Valid prescription required at checkout' : '✔ No prescription required'}</p>
          </div>

          <Section title="Description">{med.description}</Section>
          <Section title="Uses"><ul className="list-disc pl-5">{med.uses.map((u) => <li key={u}>{u}</li>)}</ul></Section>
          <Section title="Benefits"><ul className="list-disc pl-5">{med.benefits.map((b) => <li key={b}>{b}</li>)}</ul></Section>
          <Section title="Dosage">{med.dosage}</Section>
          <Section title="Side effects">{med.sideEffects}</Section>
          <Section title="Warnings"><ul className="list-disc pl-5">{med.warnings.map((w) => <li key={w}>{w}</li>)}</ul></Section>
          <Section title="Storage">{med.storage}</Section>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl text-pine">More in {med.categoryLabel}</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((m) => <ProductCard key={m.id} med={m} onQuickView={setQv} />)}
          </div>
          <QuickView med={qv} onClose={() => setQv(null)} />
        </section>
      )}
    </div>
  );
}
