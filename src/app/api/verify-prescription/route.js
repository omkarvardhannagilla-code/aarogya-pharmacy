// Gemini Vision pipeline: image quality → multilingual OCR → extraction →
// authenticity indicators → AI-generation suspicion → cart matching.
// Final decision here is a PRE-SCREEN; owner confirms via Telegram (compliance).
import { sb } from '../../../lib/supabase';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const PROMPT = (cart) => `You are a meticulous pharmacy prescription verifier for an Indian online pharmacy.
Analyze the attached prescription image and respond with ONLY valid JSON (no markdown fences), exactly this shape:
{
 "quality": {"ok": boolean, "issues": [string]},          // blurry / too dark / too bright / cropped / unreadable
 "language": string,                                       // detected language of the prescription
 "extracted": {
   "hospital": string|null, "doctor": string|null, "regNo": string|null,
   "patient": string|null, "age": string|null, "gender": string|null,
   "date": string|null, "address": string|null, "contact": string|null,
   "medicines": [{"name": string, "dosage": string|null, "frequency": string|null, "duration": string|null}],
   "notes": string|null
 },
 "authenticity": {"score": number,                        // 0-100 (100 = clearly genuine)
   "flags": [string]},                                     // layout anomalies, missing letterhead/signature, inconsistent handwriting/print, etc.
 "aiGenerated": {"suspicion": "low"|"medium"|"high", "indicators": [string]},
 "match": {"matchedCartItems": [string], "unmatchedRxCartItems": [string]}   // compare against the cart below
}
Prescriptions may be handwritten or printed, in ANY Indian language (Hindi, Telugu, Tamil, Kannada, Malayalam, Marathi, Gujarati, Bengali, Punjabi, Odia, Urdu, etc.) — read them natively and translate extracted values to English.
For "match": a cart item counts as matched if the prescription lists the same brand OR the same generic/salt (any strength close enough). List every PRESCRIPTION-REQUIRED cart item that has no support in the prescription under unmatchedRxCartItems.
Customer cart:
${cart.map((i) => `- ${i.name} | generic: ${i.generic} | qty ${i.qty} | ${i.rx ? 'Rx REQUIRED' : 'OTC'}`).join('\n')}`;

export async function POST(req) {
  try {
    const { imageBase64, mimeType = 'image/jpeg', cart = [] } = await req.json();
    const key = process.env.GEMINI_API_KEY;
    if (!key) return Response.json({ error: 'GEMINI_API_KEY not configured — see SETUP.md' }, { status: 500 });
    if (!imageBase64) return Response.json({ error: 'No image received' }, { status: 400 });

    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [
          { text: PROMPT(cart) },
          { inline_data: { mime_type: mimeType, data: imageBase64 } },
        ]}],
        generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
      }),
    });
    const data = await r.json();
    let report;
    try { report = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'); }
    catch { return Response.json({ error: 'Could not read the prescription. Please upload a clearer photo.' }, { status: 422 }); }

    // Decision policy (pre-screen): hard-reject only clear failures; owner gets final say.
    let decision = 'approved'; let reason = 'All checks passed.';
    const unmatched = report?.match?.unmatchedRxCartItems || [];
    if (!report?.quality?.ok) { decision = 'rejected'; reason = `Image quality issue: ${(report.quality?.issues || []).join(', ') || 'unreadable'}. Please retake the photo.`; }
    else if (report?.aiGenerated?.suspicion === 'high') { decision = 'rejected'; reason = 'Sorry, this medical prescription could not be verified and appears to be invalid. Please upload a genuine prescription issued by a registered medical practitioner.'; }
    else if (unmatched.length) { decision = 'rejected'; reason = `These prescription-required items are not covered by the uploaded prescription: ${unmatched.join(', ')}. Please remove them or upload the correct prescription.`; }
    else if ((report?.authenticity?.score ?? 100) < 40) { decision = 'rejected'; reason = 'The prescription could not be verified as genuine. Please upload a clear, original prescription.'; }
    const needsReview = decision === 'approved' && ((report?.authenticity?.score ?? 100) < 70 || report?.aiGenerated?.suspicion === 'medium' || !report?.extracted?.hospital);
    if (needsReview) reason = 'Pre-checks passed; the pharmacist will do a final confirmation on your order.';

    // Persist verification so place-order can validate server-side
    let verificationId = null;
    const client = sb();
    if (client) {
      const { data: row } = await client.from('verifications')
        .insert({ decision, needs_review: needsReview, report, image: imageBase64.slice(0, 2_000_000), mime: mimeType })
        .select('id').single();
      verificationId = row?.id || null;
    }
    return Response.json({ decision, reason, needsReview, verificationId, report: {
      language: report.language, extracted: report.extracted,
      authenticityScore: report?.authenticity?.score, flags: report?.authenticity?.flags,
      aiSuspicion: report?.aiGenerated?.suspicion,
    }});
  } catch (e) {
    return Response.json({ error: 'Verification failed. Please try again.' }, { status: 500 });
  }
}
