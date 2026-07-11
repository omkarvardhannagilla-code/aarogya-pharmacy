// Groq proxy — keeps the key server-side. Model: llama-3.3-70b-versatile (free tier).
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { messages, language = 'English', cart = [] } = await req.json();
    const key = process.env.GROQ_API_KEY;
    if (!key) return Response.json({ reply: '⚠️ AI is not configured yet. Add GROQ_API_KEY in your environment (see SETUP.md).' });
    const cartText = cart.length
      ? cart.map((i) => `- ${i.name} (${i.generic}) x${i.qty} — ₹${i.price * i.qty}${i.rx ? ' [PRESCRIPTION REQUIRED]' : ''}`).join('\n')
      : '(cart is empty)';
    const system = `You are the virtual pharmacy assistant of Aarogya Pharmacy, an online pharmacy delivering ONLY within Telangana, India (Cash on Delivery or UPI at the door — no online payment).
Reply ONLY in ${language}. Be warm, professional, concise (2-5 sentences unless asked for detail).
You can see the customer's live cart:
${cartText}
Rules:
- Never give medical diagnoses; suggest consulting a doctor for medical questions.
- Prescription (Rx) items require a valid prescription verified before ordering. The website flow handles upload + verification; guide users to the "Verify prescription" step when relevant.
- Delivery only within Telangana. COD/UPI only. Be honest about limitations.`;
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: 'llama-3.3-70b-versatile', temperature: 0.5, max_tokens: 500,
        messages: [{ role: 'system', content: system }, ...messages.slice(-12)] }),
    });
    const data = await r.json();
    return Response.json({ reply: data.choices?.[0]?.message?.content || 'Sorry, I could not respond just now. Please try again.' });
  } catch (e) {
    return Response.json({ reply: 'Sorry, something went wrong. Please try again.' }, { status: 200 });
  }
}
