import { sanityClient, sanityConfigured, urlFor } from './sanity';
import { supabase } from './supabase';

// ── Now ──

export async function getNow() {
  if (sanityConfigured && sanityClient) {
    const data = await sanityClient.fetch(`*[_type == "now"][0]{
      listening_text,
      reading_title,
      reading_author,
      "reading_cover_url": reading_cover.asset->url,
      reading_note,
      building_text,
      status_line
    }`);
    return data;
  }
  if (!supabase) return null;
  const { data } = await supabase.from('now').select('*').limit(1).single();
  return data;
}

// ── Site settings (Sanity only) ──

export async function getSiteSettings() {
  if (!sanityConfigured || !sanityClient) return null;
  return sanityClient.fetch(`*[_type == "siteSettings"][0]{
    bio,
    craft,
    looking_for,
    stack,
    contact_email,
    linkedin,
    github,
    twitter,
    instagram,
    "resume_url": resume.asset->url,
    "portrait_url": portrait.asset->url,
    featured_video_url,
    about_video_url,
    about_intro,
    about_gdg,
    about_interests
  }`);
}

// ── Projects ──

export async function getProjects() {
  if (sanityConfigured && sanityClient) {
    return sanityClient.fetch(`*[_type == "project" && status == "active" && featured == true] | order(sort asc) {
      "id": _id,
      name,
      "slug": slug.current,
      tagline,
      problem,
      approach,
      outcome,
      repo_url,
      live_url,
      github_sync,
      featured,
      sort,
      status,
      "has_story": defined(problem) || defined(approach) || defined(outcome) || defined(body)
    }`) ?? [];
  }
  if (!supabase) return [];
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'active')
    .eq('featured', true)
    .order('sort');
  return data ?? [];
}

export async function getProjectBySlug(slug: string) {
  if (!sanityConfigured || !sanityClient) return null;
  return sanityClient.fetch(
    `*[_type == "project" && slug.current == $slug][0]{
      "id": _id,
      name,
      "slug": slug.current,
      tagline,
      problem,
      approach,
      outcome,
      body,
      repo_url,
      live_url,
      github_sync,
      status
    }`,
    { slug },
  );
}

export async function getAllProjectStorySlugs() {
  if (!sanityConfigured || !sanityClient) return [];
  return sanityClient.fetch(
    `*[_type == "project" && defined(slug.current) && (defined(problem) || defined(approach) || defined(outcome) || defined(body))]{
      "slug": slug.current
    }`,
  ) ?? [];
}

// ── Experience (Sanity only) ──

export async function getExperience() {
  if (!sanityConfigured || !sanityClient) return [];
  return sanityClient.fetch(`*[_type == "experience"] | order(sort asc) {
    "id": _id,
    role,
    company,
    url,
    period,
    bullets,
    sort
  }`) ?? [];
}

// ── Involvements (Sanity only) ──

export async function getInvolvements() {
  if (!sanityConfigured || !sanityClient) return [];
  return sanityClient.fetch(`*[_type == "involvement"] | order(sort asc) {
    "id": _id,
    title,
    role,
    blurb,
    url,
    featured,
    story,
    sort
  }`) ?? [];
}

// ── Writing: series + posts ──

export async function getSeriesWithPosts() {
  if (sanityConfigured && sanityClient) {
    return sanityClient.fetch(`*[_type == "series"] | order(sort asc) {
      "id": _id,
      "slug": slug.current,
      title,
      blurb,
      kind,
      sort,
      "posts": *[_type == "post" && references(^._id) && status == "published"] | order(published_at desc) {
        "id": _id,
        "slug": slug.current,
        title,
        excerpt,
        status,
        canonical,
        medium_url,
        published_at,
        reading_min
      }
    }`) ?? [];
  }
  if (!supabase) return [];
  const { data: series } = await supabase
    .from('series')
    .select('*')
    .order('sort');
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  return (series ?? []).map((s) => ({
    ...s,
    posts: (posts ?? []).filter((p) => p.series_id === s.id),
  }));
}

export async function getUnfiledPosts() {
  if (sanityConfigured && sanityClient) {
    return sanityClient.fetch(`*[_type == "post" && !defined(series) && status == "published"] | order(published_at desc) {
      "id": _id,
      "slug": slug.current,
      title,
      excerpt,
      status,
      canonical,
      medium_url,
      published_at,
      reading_min
    }`) ?? [];
  }
  if (!supabase) return [];
  const { data } = await supabase
    .from('posts')
    .select('*')
    .is('series_id', null)
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  return data ?? [];
}

export async function getSeriesBySlug(slug: string) {
  if (sanityConfigured && sanityClient) {
    return sanityClient.fetch(
      `*[_type == "series" && slug.current == $slug][0]{
        "id": _id,
        "slug": slug.current,
        title,
        blurb,
        kind,
        sort
      }`,
      { slug },
    );
  }
  if (!supabase) return null;
  const { data } = await supabase
    .from('series')
    .select('*')
    .eq('slug', slug)
    .single();
  return data;
}

export async function getPostsBySeries(seriesId: string) {
  if (sanityConfigured && sanityClient) {
    return sanityClient.fetch(
      `*[_type == "post" && series._ref == $seriesId && status == "published"] | order(published_at desc) {
        "id": _id,
        "slug": slug.current,
        title,
        body,
        excerpt,
        status,
        canonical,
        medium_url,
        published_at,
        reading_min
      }`,
      { seriesId },
    ) ?? [];
  }
  if (!supabase) return [];
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('series_id', seriesId)
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  return data ?? [];
}

export async function getPost(seriesSlug: string, postSlug: string) {
  if (sanityConfigured && sanityClient) {
    return sanityClient.fetch(
      `*[_type == "post" && slug.current == $postSlug && series->slug.current == $seriesSlug && status == "published"][0]{
        "id": _id,
        "slug": slug.current,
        title,
        body,
        excerpt,
        status,
        canonical,
        medium_url,
        published_at,
        reading_min,
        "series": series->{
          "id": _id,
          "slug": slug.current,
          title,
          blurb,
          kind
        }
      }`,
      { seriesSlug, postSlug },
    );
  }
  if (!supabase) return null;
  const series = await getSeriesBySlug(seriesSlug);
  if (!series) return null;
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('series_id', series.id)
    .eq('slug', postSlug)
    .eq('status', 'published')
    .single();
  return data ? { ...data, series } : null;
}

export async function getUnfiledPost(postSlug: string) {
  if (sanityConfigured && sanityClient) {
    return sanityClient.fetch(
      `*[_type == "post" && slug.current == $postSlug && !defined(series) && status == "published" && canonical == "self"][0]{
        "id": _id,
        "slug": slug.current,
        title,
        body,
        excerpt,
        status,
        canonical,
        medium_url,
        published_at,
        reading_min
      }`,
      { postSlug },
    );
  }
  if (!supabase) return null;
  const { data } = await supabase
    .from('posts')
    .select('*')
    .is('series_id', null)
    .eq('slug', postSlug)
    .eq('status', 'published')
    .eq('canonical', 'self')
    .single();
  return data;
}

export async function getAllPublishedPosts() {
  if (sanityConfigured && sanityClient) {
    return sanityClient.fetch(`*[_type == "post" && status == "published"] | order(published_at desc) {
      "id": _id,
      "slug": slug.current,
      title,
      excerpt,
      status,
      canonical,
      medium_url,
      published_at,
      reading_min,
      "series": series->{ "slug": slug.current }
    }`) ?? [];
  }
  if (!supabase) return [];
  const { data } = await supabase
    .from('posts')
    .select('*, series:series_id(slug)')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  return data ?? [];
}

// ── Static path helpers (for getStaticPaths in writing pages) ──

export async function getAllSeriesSlugs() {
  if (sanityConfigured && sanityClient) {
    return sanityClient.fetch(`*[_type == "series"]{ "slug": slug.current }`) ?? [];
  }
  if (!supabase) return [];
  const { data } = await supabase.from('series').select('slug');
  return data ?? [];
}

export async function getAllUnfiledPostSlugs() {
  if (sanityConfigured && sanityClient) {
    return sanityClient.fetch(
      `*[_type == "post" && !defined(series) && status == "published" && canonical == "self"]{ "slug": slug.current }`,
    ) ?? [];
  }
  if (!supabase) return [];
  const { data } = await supabase
    .from('posts')
    .select('slug')
    .is('series_id', null)
    .eq('status', 'published')
    .eq('canonical', 'self');
  return data ?? [];
}

export async function getAllSeriesPostPaths() {
  if (sanityConfigured && sanityClient) {
    return sanityClient.fetch(
      `*[_type == "post" && defined(series) && status == "published" && canonical == "self"]{
        "slug": slug.current,
        canonical,
        "series": series->{ "slug": slug.current }
      }`,
    ) ?? [];
  }
  if (!supabase) return [];
  const { data } = await supabase
    .from('posts')
    .select('slug, canonical, series:series_id(slug)')
    .eq('status', 'published')
    .eq('canonical', 'self')
    .not('series_id', 'is', null);
  return data ?? [];
}

// ── Map: places (Sanity-first, Supabase fallback) ──
// Both sources are normalized to one shape the map consumes:
//   { id, name, lat, lng, arrived_on, kind, pin_type, note, sort,
//     place_media: [{ url, caption }] }   // url is already resolved

export async function getPlaces() {
  if (sanityConfigured && sanityClient) {
    const places = await sanityClient.fetch(`*[_type == "place"] | order(sort asc) {
      "id": _id,
      name,
      lat,
      lng,
      arrived_on,
      kind,
      pin_type,
      note,
      sort,
      "place_media": media[]{
        "url": coalesce(asset->url, image.asset->url) + "?w=1200&auto=format",
        caption
      }
    }`);
    return (places ?? []).map((p: any) => ({
      ...p,
      place_media: (p.place_media ?? []).filter((m: any) => m.url),
    }));
  }

  if (!supabase) return [];
  const base = (import.meta.env.SUPABASE_URL ?? '').replace(/\/$/, '');
  const { data: places } = await supabase
    .from('places')
    .select('*, place_media(*)')
    .order('sort');
  return (places ?? []).map((p: any) => ({
    ...p,
    place_media: (p.place_media ?? []).map((m: any) => ({
      url: base ? `${base}/storage/v1/object/public/${m.storage_path}` : m.storage_path,
      caption: m.caption,
    })),
  }));
}
