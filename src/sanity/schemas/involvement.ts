export default {
  name: 'involvement',
  title: 'Involvement',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: (R: any) => R.required() },
    { name: 'role', title: 'Role', type: 'string' },
    { name: 'blurb', title: 'Blurb', type: 'text', rows: 3 },
    { name: 'url', title: 'URL', type: 'url' },
    { name: 'featured', title: 'Featured on homepage', type: 'boolean', initialValue: false, description: 'Show as the wide story card above the list' },
    { name: 'story', title: 'Featured story', type: 'text', rows: 5, description: 'Longer narrative shown when featured' },
    { name: 'sort', title: 'Sort order', type: 'number', initialValue: 0 },
  ],
  orderings: [{ title: 'Sort order', name: 'sort', by: [{ field: 'sort', direction: 'asc' }] }],
};
