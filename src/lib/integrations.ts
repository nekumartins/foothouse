const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_RECENTLY_PLAYED_URL = 'https://api.spotify.com/v1/me/player/recently-played?limit=1';
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

    if (nowRes.status === 200) {
      const data = await nowRes.json();
      if (data.item) {
        return {
          isPlaying: data.is_playing ?? true,
          track: data.item.name,
          artist: data.item.artists?.map((a: any) => a.name).join(', ') ?? '',
          album: data.item.album?.name ?? '',
          albumArt: data.item.album?.images?.[1]?.url ?? data.item.album?.images?.[0]?.url ?? null,
          progressMs: data.progress_ms ?? 0,
          durationMs: data.item.duration_ms ?? 0,
        };
      }
    }

    const recentRes = await fetch(SPOTIFY_RECENTLY_PLAYED_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (recentRes.ok) {
      const data = await recentRes.json();
      const item = data.items?.[0]?.track;
      if (item) {
        return {
          isPlaying: false,
          track: item.name,
          artist: item.artists?.map((a: any) => a.name).join(', ') ?? '',
          album: item.album?.name ?? '',
          albumArt: item.album?.images?.[1]?.url ?? item.album?.images?.[0]?.url ?? null,
          progressMs: 0,
          durationMs: item.duration_ms ?? 0,
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
