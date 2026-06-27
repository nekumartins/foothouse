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

export async function getSpotifyListening(): Promise<string | null> {
  const token = await getSpotifyAccessToken();
  if (!token) return null;

  try {
    const nowRes = await fetch(SPOTIFY_NOW_PLAYING_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (nowRes.status === 200) {
      const data = await nowRes.json();
      if (data.item) {
        const track = data.item.name;
        const artist = data.item.artists?.[0]?.name;
        return artist ? `${track} by ${artist}` : track;
      }
    }

    const recentRes = await fetch(SPOTIFY_RECENTLY_PLAYED_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (recentRes.ok) {
      const data = await recentRes.json();
      const item = data.items?.[0]?.track;
      if (item) {
        const track = item.name;
        const artist = item.artists?.[0]?.name;
        return artist ? `${track} by ${artist}` : track;
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
