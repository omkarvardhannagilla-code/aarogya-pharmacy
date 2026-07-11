'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { useCart, cartCount } from '../lib/store';

export default function Navbar() {
  const { items, openDrawer } = useCart();
  const count = cartCount(items);
  const [q, setQ] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  if (pathname === '/' || pathname.startsWith('/upload/')) return null;
  const go = () => router.push(q.trim() ? `/medicines?q=${encodeURIComponent(q.trim())}` : '/medicines');
  return (
    <header className="sticky top-0 z-40 border-b border-mint-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-pine font-display text-lg text-white">A</span>
          <span className="hidden font-display text-xl text-pine sm:block">Aarogya <span className="text-ink-soft">Pharmacy</span></span>
        </Link>
        <div className="relative flex-1">
          <input
            value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && go()}
            placeholder="Search 500+ medicines, brands, salts…"
            className="w-full rounded-full bg-white px-5 py-2.5 pr-24 text-sm hairline outline-none transition focus:shadow-card"
            aria-label="Search medicines"
          />
          <button onClick={go} className="absolute right-1 top-1 rounded-full bg-pine px-4 py-1.5 text-sm font-semibold text-white hover:bg-pine-soft">Search</button>
        </div>
        <nav className="hidden items-center gap-5 text-sm font-semibold text-ink md:flex">
          <Link href="/shop" className="hover:text-pine">Home</Link>
          <Link href="/medicines" className="hover:text-pine">Medicines</Link>
          <Link href="/about" className="hover:text-pine">About</Link>
        </nav>
        <button onClick={openDrawer} className="relative grid h-10 w-10 place-items-center rounded-full hairline bg-white text-pine transition hover:bg-mint" aria-label={`Open cart, ${count} items`}>
          🛒
          {count > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-berry px-1 text-[11px] font-bold text-white">{count}</span>}
        </button>
      </div>
    </header>
  );
}
