import { supabase } from './supabase';

export async function getNow() {
  const { data } = await supabase
    .from('now')
    .select('*')
    .limit(1)
    .single();
  return data;
}

export async function getSeriesWithPosts() {
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
  const { data } = await supabase
    .from('posts')
    .select('*')
    .is('series_id', null)
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  return data ?? [];
}

export async function getSeriesBySlug(slug: string) {
  const { data } = await supabase
    .from('series')
    .select('*')
    .eq('slug', slug)
    .single();
  return data;
}

export async function getPostsBySeries(seriesId: string) {
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('series_id', seriesId)
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  return data ?? [];
}

export async function getPost(seriesSlug: string, postSlug: string) {
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
  const { data } = await supabase
    .from('posts')
    .select('*, series:series_id(slug)')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  return data ?? [];
}

export async function getPlaces() {
  const { data: places } = await supabase
    .from('places')
    .select('*, place_media(*)')
    .order('sort');
  return places ?? [];
}

export async function getProjects() {
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'active')
    .eq('featured', true)
    .order('sort');
  return data ?? [];
}
