// Creates a short-lived upload session for the QR cross-device flow.
import { sb } from '../../../lib/supabase';
export const dynamic = 'force-dynamic';
export async function POST() {
  const client = sb();
  if (!client) return Response.json({ error: 'Supabase not configured — QR upload needs it (see SETUP.md)' }, { status: 500 });
  const id = Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  await client.from('rx_sessions').insert({ id });
  return Response.json({ sessionId: id });
}
