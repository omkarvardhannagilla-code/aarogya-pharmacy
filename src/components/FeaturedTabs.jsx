'use client';
// Site 2's "Featured Products" with category tabs.
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CATEGORIES } from '../lib/catalog';
import ProductCard from './ProductCard';
import QuickView from './QuickView';

const TAB_KEYS = ['vitamins', 'fever-pain', 'skin', 'children', 'ayurvedic', 'wellness'];

export default function FeaturedTabs({ all }) {
  const tabs = CATEGORIES.filter((c) => TAB_KEYS.includes(c.key));
  const [active, setActive] = useState(tabs[0]?.key);
  const [qv, setQv] = useState(null);
  const meds = useMemo(() => all.filter((m) => m.category === active).slice(0, 4), [all, active]);
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-3xl font-bold text-ink md:text-5xl">Featured Products</h2>
        <Link href="/medicines" className="font-semibold text-pine hover:underline">View all 500+ →</Link>
      </div>
      <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto">
        {tabs.map((c) => (
          <button key={c.key} onClick={() => setActive(c.key)}
            className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition ${active === c.key ? 'bg-pine text-white' : 'bg-white text-ink hairline hover:bg-mint'}`}>
            {c.label}
          </button>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {meds.map((m) => <ProductCard key={m.id} med={m} onQuickView={setQv} />)}
      </div>
      <QuickView med={qv} onClose={() => setQv(null)} />
    </section>
  );
}
