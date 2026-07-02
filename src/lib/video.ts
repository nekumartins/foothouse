// Turns a YouTube watch/short URL into a privacy-friendly embed URL.
export function youtubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    let videoId: string | null = null;
    if (u.hostname.includes('youtube.com')) videoId = u.searchParams.get('v');
    else if (u.hostname === 'youtu.be') videoId = u.pathname.slice(1);
    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : url;
  } catch { return null; }
}
