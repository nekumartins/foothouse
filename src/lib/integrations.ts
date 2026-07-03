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

// Fallback for the homepage "Selected work" section: when no projects are
// hand-picked in the CMS, show the owner's most-starred public repos so the
// proof section is never empty. Shaped to match what ProjectCard expects.
export interface RepoCard {
  name: string;
  tagline: string;
  repo_url: string;
  live_url?: string;
  github_sync: true;
  stars: number;
}

export async function getTopGithubRepos(username: string, limit = 4): Promise<RepoCard[]> {
  if (!username) return [];
  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, {
      headers: import.meta.env.GITHUB_TOKEN
        ? { Authorization: `token ${import.meta.env.GITHUB_TOKEN}` }
        : {},
    });
    if (!res.ok) return [];
    const repos = await res.json();
    if (!Array.isArray(repos)) return [];
    return repos
      .filter((r: any) => !r.fork && !r.archived && r.description)
      .sort((a: any, b: any) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0))
      .slice(0, limit)
      .map((r: any) => ({
        name: r.name,
        tagline: r.description || '',
        repo_url: r.html_url,
        live_url: r.homepage || undefined,
        github_sync: true as const,
        stars: r.stargazers_count ?? 0,
      }));
  } catch {
    return [];
  }
}

// One work list for both the homepage and /work: hand-picked CMS projects when
// they exist, otherwise the owner's top public repos so the proof section is
// never empty. `fromGithub` lets callers show a "More on GitHub" affordance.
export async function getWorkItems(
  projects: any[],
  settings: any
): Promise<{ items: any[]; fromGithub: boolean }> {
  if (projects.length > 0) return { items: projects, fromGithub: false };
  const m = (settings?.github || '').match(/github\.com\/([^/]+)/);
  const username = m ? m[1] : 'nekumartins';
  const repos = await getTopGithubRepos(username, 4);
  return repos.length > 0 ? { items: repos, fromGithub: true } : { items: [], fromGithub: false };
}

// Latest post for the "lately" card, read from an RSS bridge. X killed its free
// public syndication endpoints (they all 403 now), so the no-cost path is a
// third-party feed: create one from your profile at rss.app (or point at any
// RSS 2.0 feed / Nitter instance) and set LATELY_RSS_URL. The parser is
// provider-agnostic. Every failure path returns null and the caller falls back
// to the hand-edited Sanity "lately" line.
function cleanTweet(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1') // unwrap CDATA
    .replace(/<[^>]+>/g, '') // strip HTML tags
    .replace(/https?:\/\/t\.co\/\S+/g, '') // drop t.co link shorteners
    .replace(/https?:\/\/\S+/g, '') // drop other trailing URLs
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function getLatestTweet(): Promise<{ text: string; url: string | null } | null> {
  const feedUrl = import.meta.env.LATELY_RSS_URL;
  if (!feedUrl) return null;

  try {
    const res = await fetch(feedUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
    });
    if (!res.ok) return null;

    const xml = await res.text();

    // First <item> in the feed is the newest post.
    const item = xml.match(/<item[\s\S]*?<\/item>/i)?.[0];
    if (!item) return null;

    const pick = (tag: string) => {
      const m = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
      return m ? m[1] : '';
    };

    // Prefer the title (rss.app puts the post text here); fall back to the body.
    const text = cleanTweet(pick('title') || pick('description'));
    if (!text) return null;

    // The item's <link> is the post itself; CDATA-wrapped in some bridges.
    const rawLink = pick('link').replace(/<!\[CDATA\[|\]\]>/g, '').trim();
    const url = /^https?:\/\//i.test(rawLink) ? rawLink : null;
    return { text, url };
  } catch {
    // fall through
  }

  return null;
}
