export default {
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    { name: 'quote', title: 'Quote', type: 'text', rows: 4, validation: (R: any) => R.required() },
    { name: 'name', title: 'Name', type: 'string', validation: (R: any) => R.required() },
    { name: 'business', title: 'Business', type: 'string', description: 'e.g. "shop owner, Lagos"' },
    {
      name: 'permission',
      title: 'Permission to appear on site',
      type: 'boolean',
      initialValue: false,
      description: 'Person agreed to appear on the site. Must be true to render.',
    },
    { name: 'sort', title: 'Sort order', type: 'number', initialValue: 0 },
  ],
  orderings: [{ title: 'Sort order', name: 'sort', by: [{ field: 'sort', direction: 'asc' }] }],
};
