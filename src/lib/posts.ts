// One place decides where a post lives: medium-canonical posts link out,
// everything else gets a site path (nested under its series when it has one).

type PostLike = {
  slug: string;
  canonical?: string;
  medium_url?: string;
  series?: { slug: string } | null;
};

export function postPath(post: PostLike, seriesSlug?: string): { href: string; external: boolean } {
  if (post.canonical === 'medium' && post.medium_url) {
    return { href: post.medium_url, external: true };
  }
  const series = seriesSlug ?? post.series?.slug;
  return {
    href: series ? `/writing/${series}/${post.slug}` : `/writing/${post.slug}`,
    external: false,
  };
}
