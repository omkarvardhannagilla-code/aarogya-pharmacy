// Experience 1 — cinematic landing. The shop (Experience 2) lives at /shop.
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ALL } from '../lib/catalog';
import HomeFeatured from '../components/HomeFeatured';

const CapsuleLanding = dynamic(() => import('../components/CapsuleLanding'), {
  ssr: false,
  loading: () => <div className="grid h-[92vh] min-h-[560px] place-items-center bg-[#0E3B2E] font-display text-2xl text-mint">Preparing your capsule…</div>,
});

const PILLARS = [
  ['Patient care, before commerce', 'Every decision — from sourcing to the way we verify prescriptions — starts with the question: is this right for the patient? Sales come second.'],
  ['Authentic, always', 'We buy only from authorised distributors, check batch and seal on arrival, and store stock in pharmacy-grade conditions. Counterfeit medicine has no path into our shelves.'],
  ['Professional by design', 'Prescription medicines move only under registered-pharmacist supervision, with our AI assistant doing the careful pre-checks so nothing slips through.'],
  ['Fast, honest delivery', 'Same-day and next-day delivery across Telangana, paid on arrival by cash or UPI. If we cannot deliver on time, we tell you before you order — not after.'],
];

export default function Landing() {
  const featured = [...ALL].sort((a, b) => b.popularity - a.popularity).slice(0, 3);
  return (
    <div>
      <CapsuleLanding />
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 md:grid-cols-2">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.2em] text-pine">The Aarogya promise</p>
          <h2 className="mt-3 font-display text-3xl leading-tight text-pine md:text-5xl">Trust is the active ingredient.</h2>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-soft">A pharmacy is only as good as the confidence people place in it. We earn that confidence with genuine medicines, transparent pricing, and a verification process that never cuts corners.</p>
          <Link href="/medicines" className="mt-6 inline-block rounded-full bg-pine px-8 py-3 font-semibold text-white transition hover:bg-pine-soft">Browse 500+ medicines</Link>
        </div>
        <HomeFeatured meds={featured} />
      </section>
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="font-display text-3xl text-pine md:text-4xl">Customer-first healthcare, in practice</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {PILLARS.map(([t, d]) => (
              <div key={t} className="rounded-3xl bg-paper p-7 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
                <h3 className="font-display text-2xl text-pine">{t}</h3>
                <p className="mt-2 leading-relaxed text-ink-soft">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="font-display text-3xl text-pine md:text-4xl">Ready when you are.</h2>
        <p className="mx-auto mt-3 max-w-xl text-ink-soft">Search by medicine, salt or brand. Add to cart. Our AI assistant guides the rest — including prescription verification for ℞ items.</p>
        <Link href="/shop" className="mt-6 inline-block rounded-full bg-pine px-10 py-4 font-semibold text-white transition hover:bg-pine-soft">Enter the pharmacy →</Link>
      </section>
    </div>
  );
}
