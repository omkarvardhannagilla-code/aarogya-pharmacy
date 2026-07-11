// Procedural 3D medicine box — every product gets a unique, animated pack
// derived from its palette. No image assets needed for 500 SKUs.
export default function MedicineBox({ med, size = 'md', float = true }) {
  const dims = { sm: { w: 74, h: 96, d: 22, f: 8 }, md: { w: 116, h: 150, d: 34, f: 10 }, lg: { w: 190, h: 244, d: 54, f: 15 } }[size];
  const { a, b, accent } = med.box;
  const pillRow = (n) => Array.from({ length: n });
  return (
    <div className="box-stage grid place-items-center" style={{ height: dims.h + 34 }}>
      <div className={`med-box ${float ? 'animate-floaty' : ''}`} style={{ width: dims.w, height: dims.h }}>
        {/* front */}
        <div className="med-face med-front" style={{ background: b, transform: `translateZ(${dims.d / 2}px)` }}>
          <div style={{ background: a, height: '30%' }} className="flex items-end px-2 pb-1">
            <span className="font-display leading-tight text-white" style={{ fontSize: dims.f + 2 }}>
              {med.brand}
            </span>
          </div>
          <div className="flex-1 px-2 pt-1.5">
            <p className="font-semibold leading-tight" style={{ color: a, fontSize: dims.f }}>{med.name}</p>
            <p className="mt-0.5 leading-tight opacity-70" style={{ color: a, fontSize: dims.f - 2.5 }}>
              {med.generic.length > 42 ? med.generic.slice(0, 42) + '…' : med.generic}
            </p>
          </div>
          <div className="flex items-center gap-1 px-2 pb-2">
            {pillRow(4).map((_, i) => (
              <span key={i} className="rounded-full" style={{ width: dims.f - 2, height: (dims.f - 2) / 2, background: i === 3 ? accent : a, opacity: i === 3 ? 1 : 0.55 }} />
            ))}
          </div>
          <div style={{ background: accent, height: 5 }} />
        </div>
        {/* right side */}
        <div className="med-face med-side" style={{ width: dims.d, height: dims.h, left: '100%', marginLeft: -dims.d / 2, background: a, filter: 'brightness(.72)', transform: `rotateY(90deg) translateZ(${dims.d / 2}px)`, transformOrigin: 'left center' }} />
        {/* top */}
        <div className="med-face med-top" style={{ width: dims.w, height: dims.d, top: -dims.d / 2, background: a, filter: 'brightness(1.12)', transform: `rotateX(90deg) translateZ(${dims.d / 2}px)`, transformOrigin: 'center top' }} />
        <div className="med-sheen" style={{ transform: `translateZ(${dims.d / 2 + 1}px)` }} />
        <div className="med-shadow" style={{ transform: `translateZ(-${dims.d}px)` }} />
      </div>
    </div>
  );
}
