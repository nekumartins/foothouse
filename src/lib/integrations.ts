const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing';

async function getSpotifyAccessToken(): Promise<string | null> {
  const clientId = import.meta.env.SPOTIFY_CLIENT_ID;
  const clientSecret = import.meta.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = import.meta.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) return null;

  try {
    const res = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.access_token ?? null;
  } catch {
    return null;
  }
}

export interface SpotifyData {
  isPlaying: boolean;
  track: string;
  artist: string;
  album: string;
  albumArt: string | null;
  progressMs: number;
  durationMs: number;
}

export async function getSpotifyListening(): Promise<string | null> {
  const data = await getSpotifyData();
  if (!data) return null;
  return data.artist ? `${data.track} by ${data.artist}` : data.track;
}

export async function getSpotifyData(): Promise<SpotifyData | null> {
  const token = await getSpotifyAccessToken();
  if (!token) return null;

  try {
    const nowRes = await fetch(SPOTIFY_NOW_PLAYING_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Only treat the card as "listening" when a track is actively playing.
    // A paused track or an idle player (204) reads as not listening.
    if (nowRes.status === 200) {
      const data = await nowRes.json();
      if (data.item && data.is_playing === true) {
        return {
          isPlaying: true,
          track: data.item.name,
          artist: data.item.artists?.map((a: any) => a.name).join(', ') ?? '',
          album: data.item.album?.name ?? '',
          albumArt: data.item.album?.images?.[1]?.url ?? data.item.album?.images?.[0]?.url ?? null,
          progressMs: data.progress_ms ?? 0,
          durationMs: data.item.duration_ms ?? 0,
        };
      }
    }
  } catch {
    // fall through
  }

  return null;
}

export async function getGitHubBuilding(repo?: string): Promise<string | null> {
  const target = repo || import.meta.env.GITHUB_PINNED_REPO;
  if (!target) return null;

  try {
    const res = await fetch(`https://api.github.com/repos/${target}/commits?per_page=1`, {
      headers: import.meta.env.GITHUB_TOKEN
        ? { Authorization: `token ${import.meta.env.GITHUB_TOKEN}` }
        : {},
    });
    if (!res.ok) return null;
    const commits = await res.json();
    const latest = commits[0];
    if (!latest) return null;

    const message = latest.commit?.message?.split('\n')[0] ?? '';
    const repoName = target.split('/')[1] ?? target;
    return `${repoName}: ${message}`;
  } catch {
    return null;
  }
}

// Best-effort, unofficial fetch of the latest tweet via the public syndication
// (embed-timeline) endpoint. No auth, no paid API. The shape can change without
// notice, so every failure path returns null and the caller falls back to the
// hand-edited Sanity "lately" line.
function cleanTweet(text: string): string {
  return text
    .replace(/https?:\/\/t\.co\/\S+/g, '') // drop t.co link shorteners
    .replace(/\s+/g, ' ')
    .trim();
}

export async function getLatestTweet(username?: string): Promise<string | null> {
  const handle = (username || import.meta.env.TWITTER_USERNAME || 'nekumartins')
    .replace(/^@/, '')
    .trim();
  if (!handle) return null;

  const url = `https://syndication.twitter.com/srv/timeline-profile/screen-name/${handle}?showReplies=false`;

  try {
    const res = await fetch(url, {
      headers: {
        // A browser-ish UA keeps the endpoint from returning an empty shell.
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        Accept: 'text/html',
      },
    });
    if (!res.ok) return null;

    const html = await res.text();
    const match = html.match(
      /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
    );
    if (!match) return null;

    const json = JSON.parse(match[1]);
    const entries = json?.props?.pageProps?.timeline?.entries ?? [];

    for (const entry of entries) {
      const tweet = entry?.content?.tweet;
      if (!tweet) continue;
      // Skip retweets; replies are already excluded by showReplies=false.
      if (tweet.retweeted_status || tweet.in_reply_to_screen_name) continue;
      const text = cleanTweet(tweet.full_text ?? tweet.text ?? '');
      if (text) return text;
    }
  } catch {
    // fall through
  }

  return null;
}
