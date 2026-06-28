export default {
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string', validation: (R: any) => R.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' } },
    { name: 'tagline', title: 'Tagline', type: 'string' },
    { name: 'live_url', title: 'Live URL', type: 'url' },
    { name: 'repo_url', title: 'Repo URL', type: 'url' },
    { name: 'github_sync', title: 'Sync GitHub stars', type: 'boolean', initialValue: false },
    { name: 'featured', title: 'Featured', type: 'boolean', initialValue: true },
    { name: 'status', title: 'Status', type: 'string', options: { list: ['active', 'archived'] }, initialValue: 'active' },
    { name: 'sort', title: 'Sort order', type: 'number', initialValue: 0 },
  ],
  orderings: [{ title: 'Sort order', name: 'sort', by: [{ field: 'sort', direction: 'asc' }] }],
};
