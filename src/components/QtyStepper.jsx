'use client';
export default function QtyStepper({ qty, onChange, size = 'md' }) {
  const s = size === 'sm' ? 'h-8 text-sm' : 'h-10';
  const btn = `grid w-9 place-items-center font-semibold text-pine transition hover:bg-mint ${s}`;
  return (
    <div className={`inline-flex items-center overflow-hidden rounded-full hairline bg-white ${s}`}>
      <button aria-label="Decrease quantity" className={btn} onClick={() => onChange(qty - 1)}>−</button>
      <span className="w-8 text-center font-semibold tabular-nums">{qty}</span>
      <button aria-label="Increase quantity" className={btn} onClick={() => onChange(qty + 1)}>+</button>
    </div>
  );
}
