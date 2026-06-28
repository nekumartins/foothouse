export default {
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: (R: any) => R.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (R: any) => R.required() },
    { name: 'series', title: 'Series', type: 'reference', to: [{ type: 'series' }] },
    { name: 'body', title: 'Body (Markdown)', type: 'text', rows: 30 },
    { name: 'excerpt', title: 'Excerpt', type: 'text', rows: 2 },
    { name: 'status', title: 'Status', type: 'string', options: { list: ['draft', 'published'] }, initialValue: 'draft' },
    { name: 'canonical', title: 'Canonical', type: 'string', options: { list: ['self', 'medium'] }, initialValue: 'self' },
    { name: 'medium_url', title: 'Medium URL', type: 'url' },
    { name: 'published_at', title: 'Published at', type: 'datetime' },
    { name: 'reading_min', title: 'Reading time (min)', type: 'number' },
  ],
  orderings: [{ title: 'Newest first', name: 'publishedDesc', by: [{ field: 'published_at', direction: 'desc' }] }],
};
