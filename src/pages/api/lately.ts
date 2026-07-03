import type { APIRoute } from 'astro';
import { getLatestTweet } from '../../lib/integrations';

// On-demand route: fetches the latest tweet at request time (server-side) so the
// "lately" card can stay fresh between rebuilds. Returns null on any failure and
// the client keeps the hand-edited Sanity line.
export const prerender = false;

export const GET: APIRoute = async () => {
  const tweet = await getLatestTweet();

  return new Response(JSON.stringify({ text: tweet?.text ?? null, url: tweet?.url ?? null }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // Tweets change slowly; cache at the edge to avoid hammering the endpoint.
      'Cache-Control': 'public, max-age=60, s-maxage=60',
    },
  });
};
