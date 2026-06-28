export default {
  name: 'series',
  title: 'Series',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: (R: any) => R.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (R: any) => R.required() },
    { name: 'blurb', title: 'Blurb', type: 'text', rows: 3 },
    { name: 'kind', title: 'Kind', type: 'string', options: { list: ['philosophy', 'engineering', 'travel', 'other'] } },
    { name: 'sort', title: 'Sort order', type: 'number', initialValue: 0 },
  ],
  orderings: [{ title: 'Sort order', name: 'sort', by: [{ field: 'sort', direction: 'asc' }] }],
};
