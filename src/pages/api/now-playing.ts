import type { APIRoute } from 'astro';
import { getSpotifyData } from '../../lib/integrations';

export const prerender = false;

export const GET: APIRoute = async () => {
  const data = await getSpotifyData();

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=15, s-maxage=15',
    },
  });
};
