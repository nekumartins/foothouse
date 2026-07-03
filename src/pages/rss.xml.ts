import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getAllPublishedPosts } from '../lib/queries';
import { postPath } from '../lib/posts';

export const GET: APIRoute = async (context) => {
  const posts = await getAllPublishedPosts();

  return rss({
    title: 'Neku Akpotohwo, writing',
    description: 'Essays by Neku Akpotohwo on engineering, philosophy, and how minds grow.',
    site: context.site!,
    items: posts.map((post: any) => ({
      title: post.title,
      description: post.excerpt || undefined,
      pubDate: post.published_at ? new Date(post.published_at) : undefined,
      // Relative site paths resolve against `site`; medium-canonical posts
      // point at their canonical home instead.
      link: postPath(post).href,
    })),
  });
};
