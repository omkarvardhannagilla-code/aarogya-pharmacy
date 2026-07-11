// Experience 2 home — same section blueprint as Site 2 (pharmacy-wcopilot):
// hero + floating pills → numbered services → why-we-are-better stats →
// featured products with category tabs → testimonials → big CTA.
import Link from 'next/link';
import { ALL } from '../../lib/catalog';
import FeaturedTabs from '../../components/FeaturedTabs';

export const metadata = { title: 'Aarogya Pharmacy — Ultimate healthcare, today and tomorrow' };

const SERVICES = [
  ['01', 'Easy to order with us', 'Search 500+ authentic medicines by name, salt or brand and check out in minutes — no account gymnastics.'],
  ['02', 'AI pharmacy assistant', 'A multilingual assistant that knows your cart, answers medicine questions and guides the whole order.'],
  ['03', 'Prescription verification', 'Upload from any device — even phone-to-desktop by QR. Our AI reads, checks and matches it to your cart.'],
  ['04', 'Clear medicine information', 'Uses, dosage, warnings, side effects and storage for every product — written to be understood.'],
  ['05', 'Pay at your door', 'Cash on delivery or UPI shown by the delivery executive. No online payment needed, ever.'],
];

const TESTIMONIALS = [
  ["The ℞ verification felt genuinely careful — they matched every medicine to my father's prescription before confirming. That's the first time an online pharmacy earned my trust.", 'Ravi Teja K.', 'Kukatpally, Hyderabad'],
  ['Ordered cold medicines at 11 in the morning, delivery reached Madhapur by evening. The assistant even answered my questions in Telugu.', 'Sowmya P.', 'Madhapur, Hyderabad'],
  ["Prices are honest, the pack visuals make everything easy to find, and COD means my grandmother can pay the way she's comfortable with.", 'Mohammed Irfan', 'Warangal'],
];

const HERO_PILLS = [
  ['#6B54FD', '-rotate-12', 'left-[6%] top-[14%]', 'h-16 w-7'],
  ['#4D7CFE', 'rotate-45', 'right-[10%] top-[10%]', 'h-14 w-6'],
  ['#FFC943', 'rotate-12', 'left-[14%] bottom-[16%]', 'h-12 w-5'],
  ['#FF6B6B', '-rotate-45', 'right-[16%] bottom-[22%]', 'h-16 w-7'],
  ['#A78BFA', 'rotate-90', 'right-[38%] top-[6%]', 'h-10 w-4'],
];

export default function ShopHome() {
  const featured = [...ALL].sort((a, b) => b.popularity - a.popularity);
  return (
    <div>
      <section className="relative overflow-hidden bg-paper">
        <div className="pointer-events-none absolute -left-20 top-6 h-72 w-72 rounded-full bg-[#6B54FD]/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-24 h-80 w-80 rounded-full bg-[#4D7CFE]/15 blur-3xl" />
        <div className="pointer-events-none absolute left-1/3 -bottom-10 h-64 w-64 rounded-full bg-[#FFC943]/20 blur-3xl" />
        {HERO_PILLS.map(([c, rot, pos, size], i) => (
          <span key={i} aria-hidden className={`pointer-events-none absolute ${pos} ${size} ${rot} animate-floaty rounded-full opacity-90 shadow-lift`} style={{ background: `linear-gradient(180deg, ${c} 50%, #ffffff 50%)`, animationDelay: `${i * 0.7}s` }} />
        ))}
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center md:py-32">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-pine">Licensed online pharmacy · Telangana</p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.08] text-ink md:text-7xl">Ultimate Healthcare, Today And Tomorrow</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-ink-soft">It's important to address your health with medicines you can trust — authentic, verified and delivered to your door.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/medicines" className="rounded-full bg-pine px-8 py-3.5 font-semibold text-white transition hover:bg-pine-soft">Buy medicine</Link>
            <Link href="/about" className="rounded-full bg-white px-8 py-3.5 font-semibold text-pine hairline transition hover:bg-mint">Get to know us</Link>
          </div>
          <div className="mx-auto mt-10 flex max-w-md items-center justify-center gap-3 rounded-full bg-white px-6 py-3 shadow-card">
            <span className="text-xl">⭐</span>
            <p className="text-sm font-semibold text-ink">4.8 happy-customer rating <span className="font-normal text-ink-soft">· 5,000+ orders delivered</span></p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1fr,1.2fr]">
        <div>
          <h2 className="font-display text-3xl font-bold text-ink md:text-5xl">All The Service You Will Get</h2>
          <p className="mt-3 max-w-sm text-ink-soft">Everything a neighbourhood chemist does — rebuilt for your screen, without losing the care.</p>
          <Link href="/about" className="mt-6 inline-block rounded-full bg-pine px-7 py-3 font-semibold text-white transition hover:bg-pine-soft">Learn more</Link>
        </div>
        <ol className="divide-y divide-mint-line rounded-3xl bg-white shadow-card">
          {SERVICES.map(([n, t, d]) => (
            <li key={n} className="group flex gap-5 p-6 transition hover:bg-mint-soft">
              <span className="font-display text-2xl font-bold text-pine">{n}</span>
              <div>
                <h3 className="font-display text-lg font-bold text-ink group-hover:text-pine">{t}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-pine-deep py-20 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold md:text-5xl">Why We Are Better</h2>
            <p className="mt-4 max-w-md leading-relaxed text-[#C9C2F5]">Anyone can list medicines. We verify them — batch by batch, prescription by prescription — and keep a registered pharmacist in the loop on every ℞ order. Speed matters, but safety comes first.</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[['500+', 'Genuine medicines'], ['21', 'Care categories'], ['24h', 'Telangana delivery']].map(([n, l]) => (
              <div key={l} className="rounded-3xl bg-white/5 p-6 text-center ring-1 ring-white/10">
                <p className="font-display text-3xl font-bold text-[#FFC943] md:text-4xl">{n}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#C9C2F5]">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FeaturedTabs all={featured} />

      <section className="bg-mint-soft py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center font-display text-3xl font-bold text-ink md:text-5xl">Welcome To Our Online Pharmacy</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-ink-soft">A professional pharmacy service is a set of actions organised around one thing: your health.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map(([q, n, c]) => (
              <figure key={n} className="rounded-3xl bg-white p-7 shadow-card">
                <span className="font-display text-4xl leading-none text-pine">“</span>
                <blockquote className="mt-1 text-sm leading-relaxed text-ink-soft">{q}</blockquote>
                <figcaption className="mt-4 font-semibold text-ink">{n} <span className="block text-xs font-normal text-ink-soft">{c}</span></figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mx-auto my-20 max-w-7xl overflow-hidden rounded-[40px] bg-pine px-6 py-16 text-center text-white">
        <span aria-hidden className="pointer-events-none absolute left-[8%] top-[18%] h-14 w-6 -rotate-12 animate-floaty rounded-full" style={{ background: 'linear-gradient(180deg,#FFC943 50%,#fff 50%)' }} />
        <span aria-hidden className="pointer-events-none absolute right-[10%] top-[24%] h-16 w-7 rotate-45 animate-floaty rounded-full" style={{ background: 'linear-gradient(180deg,#FF6B6B 50%,#fff 50%)', animationDelay: '1s' }} />
        <span aria-hidden className="pointer-events-none absolute right-[24%] bottom-[14%] h-12 w-5 rotate-12 animate-floaty rounded-full" style={{ background: 'linear-gradient(180deg,#4D7CFE 50%,#fff 50%)', animationDelay: '2s' }} />
        <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold md:text-5xl">Make An Order And Get Free Delivery</h2>
        <p className="mx-auto mt-3 max-w-md text-[#E4DFFF]">Free doorstep delivery across Telangana on every order. Pay by cash or UPI when it arrives.</p>
        <Link href="/medicines" className="mt-7 inline-block rounded-full bg-white px-9 py-3.5 font-semibold text-pine transition hover:scale-[1.03]">Make an order</Link>
      </section>
    </div>
  );
}
