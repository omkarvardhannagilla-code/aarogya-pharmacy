// Owner's order-management bot. Set the webhook once (see SETUP.md):
// https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<your-app>.vercel.app/api/telegram-webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>
// Features: 📅 calendar (last 14 days), Today/Yesterday, ✅ Approved / ❌ Denied / 🟡 Pending filters,
// per-order detail view. Only the owner chat can use it.
import { sb } from '../../../lib/supabase';
export const dynamic = 'force-dynamic';

const TG = (m) => `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${m}`;
const send = (chat_id, text, keyboard) => fetch(TG('sendMessage'), {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ chat_id, text, parse_mode: 'HTML', reply_markup: keyboard ? { inline_keyboard: keyboard } : undefined }),
});
const fmtDate = (d) => d.toISOString().slice(0, 10);
const nice = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

function menu() {
  const today = new Date(), y = new Date(Date.now() - 864e5);
  return [
    [{ text: `📦 Today (${nice(fmtDate(today))})`, callback_data: `d|${fmtDate(today)}|all` }],
    [{ text: `📦 Yesterday`, callback_data: `d|${fmtDate(y)}|all` }],
    [{ text: '📅 Pick a date', callback_data: 'cal|0' }],
  ];
}
function calendar(page = 0) {
  const rows = [];
  for (let r = 0; r < 7; r++) {
    const row = [];
    for (let c = 0; c < 2; c++) {
      const d = new Date(Date.now() - (page * 14 + r * 2 + c) * 864e5);
      row.push({ text: nice(fmtDate(d)), callback_data: `d|${fmtDate(d)}|all` });
    }
    rows.push(row);
  }
  rows.push([{ text: '« Older', callback_data: `cal|${page + 1}` }, ...(page ? [{ text: 'Newer »', callback_data: `cal|${page - 1}` }] : [])]);
  rows.push([{ text: '🏠 Menu', callback_data: 'menu' }]);
  return rows;
}
const STATUS_ICON = { approved: '✅', denied: '❌', pending: '🟡' };

async function listOrders(chatId, date, status) {
  const client = sb();
  if (!client) return send(chatId, 'Supabase not configured.');
  let q = client.from('orders').select('id,status,customer,totals,created_at').eq('date', date).order('created_at', { ascending: false });
  if (status !== 'all') q = q.eq('status', status);
  const { data } = await q;
  const filters = [[
    { text: 'All', callback_data: `d|${date}|all` },
    { text: '✅ Approved', callback_data: `d|${date}|approved` },
    { text: '❌ Denied', callback_data: `d|${date}|denied` },
    { text: '🟡 Pending', callback_data: `d|${date}|pending` },
  ], [{ text: '📅 Other date', callback_data: 'cal|0' }, { text: '🏠 Menu', callback_data: 'menu' }]];
  if (!data?.length) return send(chatId, `📭 No ${status === 'all' ? '' : status + ' '}orders on <b>${nice(date)}</b>.`, filters);
  const rows = data.slice(0, 20).map((o) => [{
    text: `${STATUS_ICON[o.status] || '•'} ${new Date(o.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · ${o.customer?.name || '—'} · ${o.totals?.count || 0} items · ₹${o.totals?.total || 0}`,
    callback_data: `o|${o.id}`,
  }]);
  return send(chatId, `📦 <b>${nice(date)}</b> — ${data.length} ${status === 'all' ? '' : status + ' '}order(s)`, [...rows, ...filters]);
}

async function orderDetail(chatId, id) {
  const client = sb();
  const { data: o } = await client.from('orders').select('*').eq('id', id).single();
  if (!o) return send(chatId, 'Order not found.');
  const ex = o.report?.extracted || {};
  const t = [
    `${STATUS_ICON[o.status]} <b>${o.id}</b> — ${o.status.toUpperCase()}`,
    `🕒 ${new Date(o.created_at).toLocaleString('en-IN')}`,
    `👤 ${o.customer?.name} · 📞 ${o.customer?.phone}`,
    `📍 ${o.customer?.address}, ${o.customer?.pincode}`,
    `🚚 ${o.eta?.text || '24–48h'} · 💵 COD/UPI · 🌐 ${o.language}`,
    ``, `💊 <b>Items</b>`,
    ...(o.items || []).map((i) => ` • ${i.name} ×${i.qty} — ₹${i.price * i.qty}${i.rx ? ' ℞' : ''}`),
    `💰 <b>₹${o.totals?.total?.toLocaleString('en-IN')}</b>`,
    o.report ? `\n🏥 ${ex.hospital || '—'} · 👨‍⚕️ ${ex.doctor || '—'}\n🧑 ${ex.patient || '—'} · 📄 ${ex.date || '—'}\n🔎 Authenticity ${o.report?.authenticity?.score ?? '—'}/100` : '',
  ];
  const kb = [];
  if (o.status === 'pending') kb.push([
    { text: '✅ Approve & dispatch', callback_data: `set|${o.id}|approved` },
    { text: '❌ Deny', callback_data: `set|${o.id}|denied` },
  ]);
  kb.push([{ text: '← Back to day', callback_data: `d|${o.date}|all` }]);
  return send(chatId, t.filter(Boolean).join('\n'), kb);
}

export async function POST(req) {
  try {
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (secret && req.headers.get('x-telegram-bot-api-secret-token') !== secret) return new Response('forbidden', { status: 403 });
    const update = await req.json();
    const msg = update.message, cb = update.callback_query;
    const chatId = String(msg?.chat?.id || cb?.message?.chat?.id || '');
    if (chatId !== String(process.env.TELEGRAM_CHAT_ID)) return Response.json({ ok: true }); // owner-only

    if (msg?.text) await send(chatId, '🏥 <b>Aarogya Orders</b>\nPick a view:', menu());
    if (cb) {
      const [k, a, b] = cb.data.split('|');
      fetch(TG('answerCallbackQuery'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ callback_query_id: cb.id }) });
      if (k === 'menu') await send(chatId, '🏥 <b>Aarogya Orders</b>', menu());
      else if (k === 'cal') await send(chatId, '📅 Pick a date:', calendar(+a));
      else if (k === 'd') await listOrders(chatId, a, b);
      else if (k === 'o') await orderDetail(chatId, a);
      else if (k === 'set') {
        // Pharmacist decision on PENDING orders only. AI-denied verifications never reach here.
        const client = sb();
        const { data: o } = await client.from('orders').select('status').eq('id', a).single();
        if (o?.status === 'pending') {
          await client.from('orders').update({ status: b }).eq('id', a);
          await send(chatId, `${STATUS_ICON[b]} Order <b>${a}</b> marked <b>${b}</b>.`);
        } else await send(chatId, 'Only pending orders can be changed here.');
        await orderDetail(chatId, a);
      }
    }
    return Response.json({ ok: true });
  } catch { return Response.json({ ok: true }); }
}
