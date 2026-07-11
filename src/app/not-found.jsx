import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4 text-center">
      <div>
        <h1 className="font-display text-5xl text-pine">Page not found</h1>
        <p className="mt-2 text-ink-soft">That medicine or page doesn't exist in our catalog.</p>
        <Link href="/medicines" className="mt-5 inline-block rounded-full bg-pine px-7 py-3 font-semibold text-white hover:bg-pine-soft">Back to shop</Link>
      </div>
    </div>
  );
}
