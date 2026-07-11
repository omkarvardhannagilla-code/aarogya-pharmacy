'use client';
// The AI pharmacy assistant — available site-wide, deeply tied to the cart.
// Flow for ℞ carts: verify prescription (file / camera / QR-to-phone) → details → confirm → order.
// OTC carts skip straight to details. Server re-validates everything.
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import QRCode from 'qrcode';
import { useCart, useOrders, cartTotal, cartHasRx, cartCount, inr } from '../lib/store';
import { compressImage } from '../lib/compressImage';
import QtyStepper from './QtyStepper';

const LANGUAGES = ['English', 'తెలుగు (Telugu)', 'हिन्दी (Hindi)', 'தமிழ் (Tamil)', 'ಕನ್ನಡ (Kannada)', 'اردو (Urdu)', 'मराठी (Marathi)', 'বাংলা (Bengali)'];
const PROGRESS = ['Uploading prescription…', 'Checking image quality…', 'Reading prescription (multilingual OCR)…', 'Detecting language…', 'Extracting doctor, hospital & medicines…', 'Matching against your cart…', 'Running authenticity checks…', 'Finalizing verification…'];

export default function Assistant() {
  const pathname = usePathname();
  const { items, setQty, remove, clear } = useCart();
  const addOrder = useOrders((s) => s.addOrder);
  const list = Object.values(items);
  const hasRx = cartHasRx(items);
  const total = cartTotal(items);

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('chat'); // chat | order
  const [language, setLanguage] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);

  // order flow state
  const [step, setStep] = useState('cart'); // cart | verify | details | confirm | done
  const [verifying, setVerifying] = useState(false);
  const [progress, setProgress] = useState('');
  const [verification, setVerification] = useState(null); // {decision, reason, verificationId, report}
  const [rxPreview, setRxPreview] = useState(null);
  const [qr, setQr] = useState(null); // {img, sessionId}
  const [form, setForm] = useState({ name: '', phone: '', address: '', pincode: '', coords: null });
  const [eta, setEta] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 1e9, behavior: 'smooth' }); }, [msgs, thinking, open, tab]);
  useEffect(() => () => clearInterval(pollRef.current), []);
  useEffect(() => {
    const h = () => { setOpen(true); setTab('order'); };
    window.addEventListener('open-assistant-order', h);
    return () => window.removeEventListener('open-assistant-order', h);
  }, []);
  useEffect(() => { if (step !== 'verify') { clearInterval(pollRef.current); setQr(null); } }, [step]);
  useEffect(() => { setVerification(null); setRxPreview(null); }, [hasRx]); // cart composition changed

  if (pathname === '/' || pathname.startsWith('/upload/')) return null;

  const say = (role, content) => setMsgs((m) => [...m, { role, content }]);

  const sendChat = async (text) => {
    if (!text.trim()) return;
    const next = [...msgs, { role: 'user', content: text }];
    setMsgs(next); setInput(''); setThinking(true);
    try {
      const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, language, cart: list }) });
      const { reply } = await r.json();
      say('assistant', reply);
    } catch { say('assistant', 'Sorry, I could not respond just now.'); }
    setThinking(false);
  };

  const pickLanguage = (l) => {
    setLanguage(l);
    setMsgs([{ role: 'assistant', content: l.startsWith('English')
      ? `Hi! I'm your Aarogya pharmacy assistant. I can answer questions, watch your cart (${cartCount(items)} items right now), verify prescriptions and place your order. How can I help?`
      : `✅ ${l}` }]);
    if (!l.startsWith('English')) sendChatInLanguage(l);
  };
  const sendChatInLanguage = async (l) => {
    setThinking(true);
    try {
      const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: 'Greet me briefly as my pharmacy assistant and tell me what you can do.' }], language: l, cart: list }) });
      const { reply } = await r.json();
      setMsgs([{ role: 'assistant', content: reply }]);
    } catch {}
    setThinking(false);
  };

  // ---------- Verification ----------
  const runVerification = async (base64, mimeType) => {
    setVerifying(true); setError(''); setVerification(null);
    let i = 0;
    const timer = setInterval(() => { setProgress(PROGRESS[Math.min(i++, PROGRESS.length - 1)]); }, 1600);
    setProgress(PROGRESS[0]);
    try {
      const r = await fetch('/api/verify-prescription', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType, cart: list }) });
      const data = await r.json();
      if (data.error) setError(data.error);
      else {
        setVerification(data);
        if (data.decision === 'approved') say('assistant', `✅ Prescription verified${data.needsReview ? ' (pharmacist will double-check on dispatch)' : ''}. ${data.report?.extracted?.doctor ? 'Doctor: ' + data.report.extracted.doctor + '. ' : ''}You can continue to delivery details.`);
        else say('assistant', `❌ ${data.reason}`);
      }
    } catch { setError('Verification failed. Please try again.'); }
    clearInterval(timer); setVerifying(false); setProgress('');
  };

  const onFile = async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    e.target.value = '';
    try {
      const dataUrl = await compressImage(f); // always jpeg after compression
      setRxPreview(dataUrl);
      runVerification(dataUrl.split(',')[1], 'image/jpeg');
    } catch { setError('Could not read that image file. Please try another photo.'); }
  };

  const startQr = async () => {
    setError('');
    try {
      const r = await fetch('/api/rx-session', { method: 'POST' });
      const { sessionId, error: err } = await r.json();
      if (err) return setError(err);
      const url = `${window.location.origin}/upload/${sessionId}`;
      const img = await QRCode.toDataURL(url, { margin: 1, width: 220, color: { dark: '#0E3B2E' } });
      setQr({ img, sessionId, url });
      pollRef.current = setInterval(async () => {
        const s = await fetch(`/api/rx-status?session=${sessionId}`).then((x) => x.json()).catch(() => null);
        if (s?.ready) {
          clearInterval(pollRef.current); setQr(null);
          setRxPreview(`data:${s.mimeType};base64,${s.imageBase64}`);
          runVerification(s.imageBase64, s.mimeType);
        }
      }, 2500);
    } catch { setError('Could not start QR session.'); }
  };

  // ---------- Details / ETA / Order ----------
  const askLocation = () => navigator.geolocation?.getCurrentPosition(
    (p) => setForm((f) => ({ ...f, coords: { lat: p.coords.latitude, lng: p.coords.longitude } })),
    () => {}, { timeout: 6000 });

  const toConfirm = async () => {
    setError('');
    if (!form.name || !/^[6-9]\d{9}$/.test(form.phone) || form.address.length < 8 || !/^\d{6}$/.test(form.pincode))
      return setError('Please fill name, a valid 10-digit mobile, full address and 6-digit pincode.');
    if (!/^5(0[0-9]|09)\d{3}$/.test(form.pincode))
      return setError('We currently deliver only within Telangana (pincodes 500xxx–509xxx).');
    setStep('confirm');
    const r = await fetch('/api/eta', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: `${form.address}, ${form.pincode}`, ...(form.coords || {}) }) }).then((x) => x.json()).catch(() => null);
    setEta(r);
  };

  const placeOrder = async () => {
    setPlacing(true); setError('');
    try {
      const r = await fetch('/api/place-order', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer: form, items: list, verificationId: verification?.verificationId, language, eta }) });
      const data = await r.json();
      if (data.error) setError(data.error);
      else {
        addOrder({
          orderId: data.orderId, status: data.status, placedAt: new Date().toISOString(),
          items: list.map((i) => ({ id: i.id, name: i.name, qty: i.qty, price: i.price, rx: i.rx })),
          total, etaText: eta?.text || '24–48 hours',
          address: `${form.address}, ${form.pincode}`,
        });
        setOrderResult(data); setStep('done'); clear();
      }
    } catch { setError('Could not place the order.'); }
    setPlacing(false);
  };

  const verified = !hasRx || verification?.decision === 'approved';

  // ---------- UI ----------
  return (
    <>
      <button onClick={() => setOpen(!open)} aria-label="Open AI pharmacy assistant"
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-pine px-5 py-3.5 font-semibold text-white shadow-lift transition hover:scale-[1.04] active:scale-[.97]">
        <span className="text-lg">✚</span> AI Assistant
        {cartCount(items) > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white/20 px-1 text-[11px]">{cartCount(items)}</span>}
      </button>

      {open && (
        <div className="fixed bottom-20 right-3 z-40 flex h-[min(640px,80vh)] w-[min(400px,94vw)] animate-pop flex-col overflow-hidden rounded-3xl bg-paper shadow-lift ring-1 ring-mint-line">
          <header className="flex items-center justify-between bg-pine px-4 py-3 text-white">
            <div>
              <p className="font-display text-lg leading-none">Aarogya Assistant</p>
              <p className="text-[11px] text-mint">{language || 'Choose a language'} · cart synced live</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close assistant" className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20">✕</button>
          </header>

          {!language ? (
            <div className="grid flex-1 place-items-center p-6">
              <div className="text-center">
                <p className="font-display text-xl text-pine">Which language do you prefer?</p>
                <p className="mt-1 text-sm text-ink-soft">మీకు ఏ భాష సౌకర్యం? · आप किस भाषा में सहज हैं?</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {LANGUAGES.map((l) => (
                    <button key={l} onClick={() => pickLanguage(l)} className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-pine hairline hover:bg-mint">{l}</button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <nav className="flex border-b border-mint-line bg-white text-sm font-bold">
                {[['chat', '💬 Chat'], ['order', `🛒 Order (${cartCount(items)})`]].map(([k, l]) => (
                  <button key={k} onClick={() => setTab(k)} className={`flex-1 py-2.5 ${tab === k ? 'border-b-2 border-pine text-pine' : 'text-ink-soft'}`}>{l}</button>
                ))}
              </nav>

              {tab === 'chat' && (
                <>
                  <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                    {msgs.map((m, i) => (
                      <div key={i} className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${m.role === 'user' ? 'ml-auto bg-pine text-white' : 'bg-white shadow-card'}`}>{m.content}</div>
                    ))}
                    {thinking && <div className="w-16 rounded-2xl bg-white px-3.5 py-2.5 shadow-card"><span className="animate-pulse">•••</span></div>}
                  </div>
                  <div className="flex gap-2 border-t border-mint-line bg-white p-3">
                    <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendChat(input)}
                      placeholder="Ask about medicines, delivery, your cart…" className="flex-1 rounded-full bg-paper px-4 py-2 text-sm hairline outline-none" />
                    <button onClick={() => sendChat(input)} className="rounded-full bg-pine px-4 py-2 text-sm font-semibold text-white hover:bg-pine-soft">Send</button>
                  </div>
                </>
              )}

              {tab === 'order' && (
                <div className="flex-1 overflow-y-auto p-4">
                  {/* progress rail */}
                  <div className="mb-3 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-ink-soft">
                    {['Cart', ...(hasRx ? ['Verify ℞'] : []), 'Details', 'Confirm'].map((s, i, arr) => (
                      <span key={s} className="flex items-center gap-1">
                        <span className={['cart', 'verify', 'details', 'confirm', 'done'].indexOf(step) >= (hasRx ? i : i > 0 ? i + 1 : 0) ? 'text-pine' : ''}>{s}</span>
                        {i < arr.length - 1 && <span>→</span>}
                      </span>
                    ))}
                  </div>

                  {step === 'cart' && (list.length === 0 ? (
                    <p className="rounded-2xl bg-white p-4 text-sm text-ink-soft shadow-card">Your cart is empty — anything you add on the site appears here instantly.</p>
                  ) : (
                    <>
                      <ul className="space-y-2">
                        {list.map((i) => (
                          <li key={i.id} className="flex items-center gap-2 rounded-2xl bg-white p-3 text-sm shadow-card">
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-semibold">{i.name} {i.rx && <span className="text-[10px] font-bold text-amber-badge">℞</span>}</p>
                              <p className="text-[12px] text-ink-soft">{inr(i.price)} × {i.qty}</p>
                            </div>
                            <QtyStepper size="sm" qty={i.qty} onChange={(q) => setQty(i.id, q)} />
                            <button onClick={() => remove(i.id)} aria-label={`Remove ${i.name}`} className="text-ink-soft hover:text-berry">✕</button>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex justify-between rounded-2xl bg-white p-3 font-bold shadow-card"><span>Total</span><span className="text-pine">{inr(total)}</span></div>
                      {hasRx && !verified && <p className="mt-2 rounded-xl bg-amber-soft p-3 text-[12px] font-medium text-amber-badge">Your cart has ℞ medicines — a valid prescription must be verified before ordering.</p>}
                      <button onClick={() => setStep(hasRx && !verified ? 'verify' : 'details')} className="mt-3 w-full rounded-full bg-pine py-3 font-semibold text-white hover:bg-pine-soft">
                        {hasRx && !verified ? 'Verify prescription →' : 'Delivery details →'}
                      </button>
                    </>
                  ))}

                  {step === 'verify' && (
                    <div className="space-y-3">
                      {rxPreview && <img src={rxPreview} alt="Prescription preview" className="mx-auto max-h-44 rounded-xl object-contain" />}
                      {verifying ? (
                        <div className="rounded-2xl bg-white p-4 text-center shadow-card">
                          <p className="animate-pulse text-2xl">🔍</p>
                          <p className="mt-1 text-sm font-semibold text-pine">{progress}</p>
                          <p className="text-[11px] text-ink-soft">usually done in under 30 seconds</p>
                        </div>
                      ) : verification?.decision === 'approved' ? (
                        <div className="rounded-2xl bg-white p-4 shadow-card">
                          <p className="font-bold text-pine">✅ Prescription verified</p>
                          <p className="mt-1 text-[13px] text-ink-soft">{verification.reason}</p>
                          {verification.report?.extracted && (
                            <p className="mt-2 rounded-xl bg-mint-soft p-2 text-[12px] text-ink-soft">
                              {verification.report.extracted.hospital && <>🏥 {verification.report.extracted.hospital}<br /></>}
                              {verification.report.extracted.doctor && <>👨‍⚕️ {verification.report.extracted.doctor}<br /></>}
                              {verification.report.extracted.patient && <>🧑 {verification.report.extracted.patient}</>}
                            </p>
                          )}
                          <button onClick={() => setStep('details')} className="mt-3 w-full rounded-full bg-pine py-3 font-semibold text-white hover:bg-pine-soft">Delivery details →</button>
                        </div>
                      ) : (
                        <>
                          {verification && <p className="rounded-xl bg-berry/10 p-3 text-[13px] font-semibold text-berry">{verification.reason}</p>}
                          {error && <p className="rounded-xl bg-berry/10 p-3 text-[13px] font-semibold text-berry">{error}</p>}
                          {qr ? (
                            <div className="rounded-2xl bg-white p-4 text-center shadow-card">
                              <img src={qr.img} alt="Scan with your phone" className="mx-auto" />
                              <p className="mt-2 text-sm font-semibold text-pine">Scan with your phone camera</p>
                              <p className="text-[11px] text-ink-soft">The photo appears here automatically — no refresh needed.</p>
                              <button onClick={() => { clearInterval(pollRef.current); setQr(null); }} className="mt-2 text-[12px] font-semibold text-ink-soft underline">Cancel</button>
                            </div>
                          ) : (
                            <div className="grid gap-2">
                              <label className="cursor-pointer rounded-full bg-pine py-3 text-center font-semibold text-white hover:bg-pine-soft">
                                📷 Use this device's camera / upload
                                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} />
                              </label>
                              <button onClick={startQr} className="rounded-full py-3 font-semibold text-pine hairline hover:bg-mint">📱 Use mobile camera (QR)</button>
                            </div>
                          )}
                        </>
                      )}
                      <button onClick={() => setStep('cart')} className="w-full text-[12px] font-semibold text-ink-soft underline">← back to cart</button>
                    </div>
                  )}

                  {step === 'details' && (
                    <div className="space-y-2">
                      {['name', 'phone', 'address', 'pincode'].map((k) => (
                        <input key={k} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                          placeholder={{ name: 'Full name', phone: 'Mobile number (10 digits)', address: 'Full delivery address', pincode: 'Pincode (Telangana: 5xxxxx)' }[k]}
                          className="w-full rounded-xl bg-white px-3 py-2.5 text-sm hairline outline-none focus:shadow-card" />
                      ))}
                      <button onClick={askLocation} className="w-full rounded-full py-2 text-[13px] font-semibold text-pine hairline hover:bg-mint">
                        {form.coords ? '✅ Location shared (better ETA)' : '📍 Share location for accurate ETA (optional)'}
                      </button>
                      <p className="rounded-xl bg-mint-soft p-2.5 text-[12px] text-ink-soft">🚚 Delivery within Telangana only · 💵 Cash on Delivery or UPI QR shown by the delivery executive.</p>
                      {error && <p className="rounded-xl bg-berry/10 p-3 text-[13px] font-semibold text-berry">{error}</p>}
                      <button onClick={toConfirm} className="w-full rounded-full bg-pine py-3 font-semibold text-white hover:bg-pine-soft">Review order →</button>
                      <button onClick={() => setStep('cart')} className="w-full text-[12px] font-semibold text-ink-soft underline">← back</button>
                    </div>
                  )}

                  {step === 'confirm' && (
                    <div className="space-y-3">
                      <div className="rounded-2xl bg-white p-4 text-sm shadow-card">
                        <p className="font-bold text-pine">Order summary</p>
                        <p className="mt-1">👤 {form.name} · 📞 {form.phone}</p>
                        <p>📍 {form.address}, {form.pincode}</p>
                        <p>🚚 ETA: {eta ? eta.text : 'calculating…'}{eta?.km ? ` (~${eta.km} km)` : ''} · 💵 COD/UPI</p>
                        <ul className="mt-2 border-t border-mint-line pt-2">
                          {list.map((i) => <li key={i.id} className="flex justify-between"><span>{i.name} ×{i.qty}</span><span>{inr(i.price * i.qty)}</span></li>)}
                        </ul>
                        <p className="mt-2 flex justify-between border-t border-mint-line pt-2 font-bold"><span>Total</span><span className="text-pine">{inr(total)}</span></p>
                        {rxPreview && <img src={rxPreview} alt="Prescription" className="mt-2 max-h-28 rounded-lg object-contain" />}
                      </div>
                      {error && <p className="rounded-xl bg-berry/10 p-3 text-[13px] font-semibold text-berry">{error}</p>}
                      <button onClick={placeOrder} disabled={placing || !verified} className="w-full rounded-full bg-pine py-3 font-semibold text-white hover:bg-pine-soft disabled:bg-ink-soft/30">
                        {placing ? 'Placing order…' : '✅ Place order (Cash on Delivery)'}
                      </button>
                      <button onClick={() => setStep('details')} className="w-full text-[12px] font-semibold text-ink-soft underline">← edit details</button>
                    </div>
                  )}

                  {step === 'done' && orderResult && (
                    <div className="grid place-items-center rounded-2xl bg-white p-6 text-center shadow-card">
                      <p className="text-4xl">🎉</p>
                      <p className="mt-2 font-display text-xl text-pine">Order {orderResult.orderId}</p>
                      <p className="mt-1 text-sm text-ink-soft">{orderResult.message}</p>
                      {eta?.text && <p className="mt-1 text-sm font-semibold text-pine">Estimated delivery: {eta.text}</p>}
                      <a href="/orders" className="mt-4 inline-block rounded-full bg-pine px-6 py-2.5 font-semibold text-white hover:bg-pine-soft">View my orders →</a>
                      <button onClick={() => { setStep('cart'); setOrderResult(null); setVerification(null); setRxPreview(null); setTab('chat'); }}
                        className="mt-2 text-[12px] font-semibold text-ink-soft underline">Close</button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
