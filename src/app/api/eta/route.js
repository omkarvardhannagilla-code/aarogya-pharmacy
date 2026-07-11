// Delivery ETA: geocode via OpenStreetMap Nominatim (free, no key) + haversine
// from the pharmacy. Falls back to a static estimate if geocoding fails.
export const dynamic = 'force-dynamic';
const PHARM = { lat: +(process.env.PHARMACY_LAT || 17.3850), lng: +(process.env.PHARMACY_LNG || 78.4867) };

function haversineKm(a, b) {
  const R = 6371, d = Math.PI / 180;
  const x = Math.sin((b.lat - a.lat) * d / 2) ** 2 + Math.cos(a.lat * d) * Math.cos(b.lat * d) * Math.sin((b.lng - a.lng) * d / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export async function POST(req) {
  try {
    const { address, lat, lng } = await req.json();
    let point = (lat && lng) ? { lat: +lat, lng: +lng } : null;
    let inTelangana = null;
    if (!point && address) {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(address + ', Telangana, India')}`,
        { headers: { 'User-Agent': 'AarogyaPharmacy/1.0 (demo project)' } });
      const j = await r.json();
      if (j?.[0]) { point = { lat: +j[0].lat, lng: +j[0].lon }; inTelangana = /telangana/i.test(j[0].display_name); }
    }
    if (!point) return Response.json({ etaMinutes: null, text: '24–48 hours (standard)', km: null, inTelangana });
    const km = haversineKm(PHARM, point);
    const roadKm = km * 1.35;                       // road factor over straight-line
    const mins = Math.round(20 + (roadKm / 22) * 60); // 20 min prep + 22 km/h city average
    const text = mins <= 90 ? `≈ ${mins} minutes` : mins <= 300 ? `≈ ${Math.round(mins / 60)}–${Math.round(mins / 60) + 1} hours` : 'By tomorrow';
    return Response.json({ etaMinutes: mins, text, km: Math.round(roadKm), inTelangana });
  } catch { return Response.json({ etaMinutes: null, text: '24–48 hours (standard)', km: null, inTelangana: null }); }
}
