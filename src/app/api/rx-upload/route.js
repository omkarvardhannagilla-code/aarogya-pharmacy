// Mobile posts the captured prescription here (keyed by session).
import { sb } from '../../../lib/supabase';
export const dynamic = 'force-dynamic';
export async function POST(req) {
  const client = sb();
  if (!client) return Response.json({ error: 'Not configured' }, { status: 500 });
  const { sessionId, imageBase64, mimeType } = await req.json();
  if (!sessionId || !imageBase64) return Response.json({ error: 'Missing data' }, { status: 400 });
  const { error } = await client.from('rx_sessions').update({ image: imageBase64, mime: mimeType || 'image/jpeg' }).eq('id', sessionId);
  if (error) return Response.json({ error: 'Session not found' }, { status: 404 });
  return Response.json({ ok: true });
}
