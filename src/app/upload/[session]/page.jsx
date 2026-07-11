'use client';
// Mobile page opened by scanning the QR on desktop. Capture → confirm → upload.
import { useState } from 'react';
import { useParams } from 'next/navigation';

export default function MobileUpload() {
  const { session } = useParams();
  const [preview, setPreview] = useState(null);
  const [mime, setMime] = useState('image/jpeg');
  const [state, setState] = useState('idle'); // idle | sending | done | error

  const onPick = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    setMime(f.type || 'image/jpeg');
    const r = new FileReader();
    r.onload = () => setPreview(r.result);
    r.readAsDataURL(f);
  };
  const send = async () => {
    setState('sending');
    try {
      const res = await fetch('/api/rx-upload', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session, imageBase64: preview.split(',')[1], mimeType: mime }) });
      setState(res.ok ? 'done' : 'error');
    } catch { setState('error'); }
  };

  return (
    <div className="mx-auto grid min-h-[80vh] max-w-md place-items-center px-5 py-10 text-center">
      <div className="w-full">
        <p className="font-display text-3xl text-pine">Aarogya Pharmacy</p>
        {state === 'done' ? (
          <div className="mt-6 rounded-3xl bg-white p-8 shadow-card">
            <p className="text-4xl">✅</p>
            <h1 className="mt-2 font-display text-2xl text-pine">Prescription sent</h1>
            <p className="mt-1 text-ink-soft">It's already appearing on your other screen. You can close this page.</p>
          </div>
        ) : (
          <div className="mt-6 rounded-3xl bg-white p-6 shadow-card">
            <h1 className="font-display text-2xl text-pine">Capture your prescription</h1>
            <p className="mt-1 text-sm text-ink-soft">Fill the frame, good light, all corners visible.</p>
            {preview && <img src={preview} alt="Prescription preview" className="mx-auto mt-4 max-h-72 rounded-xl object-contain" />}
            <label className="mt-5 block cursor-pointer rounded-full bg-pine px-6 py-3 font-semibold text-white hover:bg-pine-soft">
              {preview ? 'Retake photo' : '📷 Open camera'}
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={onPick} />
            </label>
            {preview && (
              <button onClick={send} disabled={state === 'sending'} className="mt-3 w-full rounded-full py-3 font-semibold text-pine hairline hover:bg-mint disabled:opacity-50">
                {state === 'sending' ? 'Sending…' : 'Looks good — send to desktop →'}
              </button>
            )}
            {state === 'error' && <p className="mt-3 text-sm font-semibold text-berry">Upload failed — check connection and try again.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
