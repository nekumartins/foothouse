import type { APIRoute } from 'astro';
import { getSpotifyListening } from '../../lib/integrations';

// On-demand route: runs on the server at request time so the Spotify secret
// stays server-side and the now-playing card reflects what's playing *now*.
export const prerender = false;

export const GET: APIRoute = async () => {
  const listening = await getSpotifyListening();

  return new Response(JSON.stringify({ listening }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // Let a CDN serve a recent value but refresh often enough to feel live.
      'Cache-Control': 'public, max-age=20, s-maxage=20',
    },
  });
};
