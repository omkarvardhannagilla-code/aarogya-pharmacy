// Final order placement. Server-side re-validation:
//  - Telangana-only pincode gate
//  - Rx carts MUST reference an approved verification row
// Then: save to Supabase + notify owner on Telegram (message + prescription photo).
import { sb } from '../../../lib/supabase';
export const dynamic = 'force-dynamic';

const TG = (path) => `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${path}`;
const isTelanganaPin = (pin) => /^5(0[0-9]|09)\d{3}$/.test(String(pin || '')); // 500xxx–509xxx

export async function POST(req) {
  try {
    const { customer, items, verificationId, language, eta } = await req.json();
    if (!customer?.name || !customer?.phone || !customer?.address || !customer?.pincode)
      return Response.json({ error: 'Missing customer details' }, { status: 400 });
    if (!/^[6-9]\d{9}$/.test(customer.phone)) return Response.json({ error: 'Enter a valid 10-digit mobile number' }, { status: 400 });
    if (!isTelanganaPin(customer.pincode))
      return Response.json({ error: 'Sorry — we currently deliver only within Telangana (pincodes 500xxx–509xxx).' }, { status: 400 });
    if (!Array.isArray(items) || !items.length) return Response.json({ error: 'Cart is empty' }, { status: 400 });

    const hasRx = items.some((i) => i.rx);
    const client = sb();
    let verification = null;
    if (hasRx) {
      if (!verificationId) return Response.json({ error: 'Prescription verification is required for this order.' }, { status: 403 });
      if (client) {
        const { data } = await client.from('verifications').select('*').eq('id', verificationId).single();
        if (!data || data.decision !== 'approved')
          return Response.json({ error: 'Prescription verification is missing or was not approved.' }, { status: 403 });
        verification = data;
      }
    }

    const total = items.reduce((n, i) => n + i.price * i.qty, 0);
    const count = items.reduce((n, i) => n + i.qty, 0);
    const orderId = 'AAR-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 5).toUpperCase();
    const now = new Date();
    const status = verification?.needs_review ? 'pending' : 'approved';

    if (client) await client.from('orders').insert({
      id: orderId, date: now.toISOString().slice(0, 10), status,
      customer, items, totals: { total, count }, language: language || 'English',
      eta: eta || null, verification_id: verificationId || null,
      report: verification?.report || null,
    });

    // ---- Telegram notification to owner ----
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      const r = verification?.report || {};
      const ex = r.extracted || {};
      const lines = [
        `🧾 <b>NEW ORDER ${orderId}</b>  ${status === 'approved' ? '✅ AI-APPROVED' : '🟡 NEEDS FINAL REVIEW'}`,
        `📅 ${now.toLocaleDateString('en-IN')}  🕒 ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
        ``,
        `👤 <b>${customer.name}</b>  📞 ${customer.phone}`,
        `📍 ${customer.address}, ${customer.pincode}` + (customer.coords ? `\n🗺 https://maps.google.com/?q=${customer.coords.lat},${customer.coords.lng}` : ''),
        `🚚 ETA: ${eta?.text || '24–48h'}   💵 Cash on Delivery / UPI at door`,
        `🌐 Language: ${language || 'English'}`,
        ``,
        `💊 <b>Items (${count})</b>`,
        ...items.map((i) => ` • ${i.name} ×${i.qty} — ₹${i.price * i.qty}${i.rx ? '  ℞' : ''}`),
        `💰 <b>Total: ₹${total.toLocaleString('en-IN')}</b>`,
      ];
      if (hasRx) lines.push(``, `🏥 Hospital: ${ex.hospital || '—'}`, `👨‍⚕️ Doctor: ${ex.doctor || '—'} ${ex.regNo ? '(' + ex.regNo + ')' : ''}`,
        `🧑 Patient: ${ex.patient || '—'} ${ex.age ? '· ' + ex.age : ''}`, `📄 Rx date: ${ex.date || '—'} · Language: ${r.language || '—'}`,
        `🔎 Authenticity ${r.authenticity?.score ?? r.authenticityScore ?? '—'}/100 · AI-gen suspicion: ${r.aiGenerated?.suspicion ?? '—'}`,
        (r.authenticity?.flags?.length ? '⚑ ' + r.authenticity.flags.join('; ') : ''));
      await fetch(TG('sendMessage'), { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: lines.filter(Boolean).join('\n'), parse_mode: 'HTML' }) });
      if (verification?.image) {
        const buf = Buffer.from(verification.image, 'base64');
        const fd = new FormData();
        fd.append('chat_id', process.env.TELEGRAM_CHAT_ID);
        fd.append('caption', `Prescription for ${orderId}`);
        fd.append('photo', new Blob([buf], { type: verification.mime || 'image/jpeg' }), 'prescription.jpg');
        await fetch(TG('sendPhoto'), { method: 'POST', body: fd });
      }
    }
    return Response.json({ orderId, status, message: status === 'approved'
      ? 'Order placed! Pay by cash or UPI when it arrives.'
      : 'Order received — our pharmacist will confirm your prescription shortly, then dispatch.' });
  } catch (e) {
    return Response.json({ error: 'Could not place the order. Please try again.' }, { status: 500 });
  }
}
