'use client';
import { useState } from 'react';
import MedicineBox from './MedicineBox';
import ProductCard from './ProductCard';
import QuickView from './QuickView';

export default function HomeFeatured({ meds }) {
  return (
    <div className="relative mx-auto grid h-[340px] w-full max-w-md place-items-center md:h-[420px]">
      <div className="absolute inset-6 rounded-[40px] bg-mint" />
      {meds.map((m, i) => (
        <div key={m.id} className="absolute" style={{ transform: `translate(${(i - 1) * 88}px, ${i === 1 ? -20 : 26}px) scale(${i === 1 ? 1.12 : 0.9})`, zIndex: i === 1 ? 2 : 1 }}>
          <MedicineBox med={m} size="md" />
        </div>
      ))}
    </div>
  );
}

export function FeaturedGrid({ meds }) {
  const [qv, setQv] = useState(null);
  return (
    <section className="pb-6">
      <h2 className="font-display text-3xl text-pine">Most trusted this week</h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {meds.map((m) => <ProductCard key={m.id} med={m} onQuickView={setQv} />)}
      </div>
      <QuickView med={qv} onClose={() => setQv(null)} />
    </section>
  );
}
