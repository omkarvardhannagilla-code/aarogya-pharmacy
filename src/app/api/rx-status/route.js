// Desktop polls this until the mobile upload lands (then the image is consumed).
import { sb } from '../../../lib/supabase';
export const dynamic = 'force-dynamic';
export async function GET(req) {
  const client = sb();
  if (!client) return Response.json({ error: 'Not configured' }, { status: 500 });
  const sessionId = new URL(req.url).searchParams.get('session');
  const { data } = await client.from('rx_sessions').select('image,mime').eq('id', sessionId).single();
  if (!data?.image) return Response.json({ ready: false });
  await client.from('rx_sessions').update({ image: null }).eq('id', sessionId); // one-shot consume
  return Response.json({ ready: true, imageBase64: data.image, mimeType: data.mime });
}
