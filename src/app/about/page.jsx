export const metadata = { title: 'About us — Aarogya Pharmacy' };
const VALUES = [
  ['Our mission', 'To make authentic, affordable medicine as easy to reach as it should be — for every household in Telangana, without compromise or confusion.'],
  ['Healthcare philosophy', 'Medicine is trust in physical form. We believe every strip and bottle we dispense carries a responsibility: correct product, correct strength, correct guidance, every single time.'],
  ['Authentic medicines', 'We source exclusively from authorised distributors, verify batch numbers and expiry on receipt, and store everything under pharmacy-grade conditions until it leaves for your door.'],
  ['Customer commitment', 'Clear prices, honest availability, and no shortcuts on prescription verification. If something is not right for you, we would rather say so than make a sale.'],
  ['Professional support', 'Prescription medicines are dispensed under the supervision of registered pharmacists, and our AI assistant is being built to guide — never to replace — professional judgement.'],
];
export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 md:px-6">
      <p className="text-sm font-bold uppercase tracking-[.2em] text-pine">About Aarogya Pharmacy</p>
      <h1 className="mt-3 font-display text-4xl leading-tight text-pine md:text-5xl">Care you can verify, delivered to your door.</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">Aarogya began with a simple observation: buying medicine should feel as safe as visiting a trusted neighbourhood chemist — with the convenience of it arriving at home. Everything we build, from our catalog to our AI-assisted prescription checks, exists to serve that feeling of safety.</p>
      <div className="mt-10 space-y-4">
        {VALUES.map(([t, d]) => (
          <section key={t} className="rounded-2xl bg-white p-6 shadow-card">
            <h2 className="font-display text-2xl text-pine">{t}</h2>
            <p className="mt-2 leading-relaxed text-ink-soft">{d}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
