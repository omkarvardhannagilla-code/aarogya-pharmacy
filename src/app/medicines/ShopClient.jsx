'use client';
import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ALL, CATEGORIES, MANUFACTURERS, searchMedicines, applyFilters, SORTERS } from '../../lib/catalog';
import ProductCard from '../../components/ProductCard';
import QuickView from '../../components/QuickView';

const PAGE_SIZE = 24;
const MAX_PRICE = 3200;

export default function ShopClient() {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [category, setCategory] = useState(params.get('cat') || '');
  const [rx, setRx] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [manufacturer, setManufacturer] = useState('');
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [sort, setSort] = useState('popular');
  const [page, setPage] = useState(1);
  const [qv, setQv] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => { setQ(params.get('q') || ''); setCategory(params.get('cat') || ''); setPage(1); }, [params]);
  useEffect(() => { setPage(1); }, [q, category, rx, inStockOnly, manufacturer, maxPrice, sort]);

  const results = useMemo(() => {
    let list = searchMedicines(ALL, q);
    list = applyFilters(list, { category, rx, inStockOnly, manufacturer, minPrice: 0, maxPrice });
    return [...list].sort(SORTERS[sort].fn);
  }, [q, category, rx, inStockOnly, manufacturer, maxPrice, sort]);

  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const shown = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const reset = () => { setQ(''); setCategory(''); setRx('all'); setInStockOnly(false); setManufacturer(''); setMaxPrice(MAX_PRICE); };

  const Filters = (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-bold text-pine">Search</label>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, salt, brand…" className="mt-1 w-full rounded-xl bg-white px-3 py-2 text-sm hairline outline-none focus:shadow-card" />
      </div>
      <div>
        <label className="text-sm font-bold text-pine">Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full rounded-xl bg-white px-3 py-2 text-sm hairline">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label} ({c.count})</option>)}
        </select>
      </div>
      <div>
        <label className="text-sm font-bold text-pine">Prescription</label>
        <div className="mt-1 grid grid-cols-3 overflow-hidden rounded-xl hairline text-center text-sm font-semibold">
          {[['all', 'All'], ['otc', 'OTC'], ['rx', '℞ only']].map(([v, l]) => (
            <button key={v} onClick={() => setRx(v)} className={`py-2 transition ${rx === v ? 'bg-pine text-white' : 'bg-white text-ink hover:bg-mint'}`}>{l}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-bold text-pine">Max price · ₹{maxPrice.toLocaleString('en-IN')}</label>
        <input type="range" min="10" max={MAX_PRICE} step="10" value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} className="mt-2 w-full accent-pine" />
      </div>
      <div>
        <label className="text-sm font-bold text-pine">Manufacturer</label>
        <select value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} className="mt-1 w-full rounded-xl bg-white px-3 py-2 text-sm hairline">
          <option value="">All manufacturers</option>
          {MANUFACTURERS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold text-ink">
        <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="h-4 w-4 accent-pine" />
        In stock only
      </label>
      <button onClick={reset} className="w-full rounded-full py-2 text-sm font-semibold text-pine hairline hover:bg-mint">Clear all filters</button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-pine">All medicines</h1>
          <p className="text-sm text-ink-soft">{results.length} of {ALL.length} products{q && <> for “<span className="font-semibold text-ink">{q}</span>”</>}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setFiltersOpen(!filtersOpen)} className="rounded-full px-4 py-2 text-sm font-semibold text-pine hairline hover:bg-mint lg:hidden">{filtersOpen ? 'Hide' : 'Show'} filters</button>
          <label className="text-sm font-semibold text-ink-soft">Sort</label>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-full bg-white px-4 py-2 text-sm font-semibold hairline">
            {Object.entries(SORTERS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-6 grid gap-8 lg:grid-cols-[260px,1fr]">
        <aside className={`${filtersOpen ? 'block' : 'hidden'} h-fit rounded-3xl bg-white p-5 shadow-card lg:sticky lg:top-20 lg:block`}>{Filters}</aside>
        <div>
          {shown.length === 0 ? (
            <div className="grid h-64 place-items-center rounded-3xl bg-white text-center shadow-card">
              <div>
                <p className="font-display text-2xl text-pine">No medicines match those filters</p>
                <button onClick={reset} className="mt-3 rounded-full bg-pine px-6 py-2 font-semibold text-white hover:bg-pine-soft">Clear filters</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((m) => <ProductCard key={m.id} med={m} onQuickView={setQv} />)}
            </div>
          )}
          {pages > 1 && (
            <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-full px-4 py-2 text-sm font-semibold text-pine hairline hover:bg-mint disabled:opacity-40">← Prev</button>
              {Array.from({ length: pages }).map((_, i) => {
                const n = i + 1;
                if (pages > 9 && Math.abs(n - page) > 2 && n !== 1 && n !== pages) return n === 2 || n === pages - 1 ? <span key={n} className="text-ink-soft">…</span> : null;
                return <button key={n} onClick={() => setPage(n)} className={`h-9 w-9 rounded-full text-sm font-semibold transition ${n === page ? 'bg-pine text-white' : 'hairline bg-white text-ink hover:bg-mint'}`}>{n}</button>;
              })}
              <button disabled={page === pages} onClick={() => setPage(page + 1)} className="rounded-full px-4 py-2 text-sm font-semibold text-pine hairline hover:bg-mint disabled:opacity-40">Next →</button>
            </nav>
          )}
        </div>
      </div>
      <QuickView med={qv} onClose={() => setQv(null)} />
    </div>
  );
}
