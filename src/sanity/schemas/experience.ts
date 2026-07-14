export default {
  name: 'experience',
  title: 'Experience',
  type: 'document',
  fields: [
    { name: 'role', title: 'Role', type: 'string', validation: (R: any) => R.required(), description: 'e.g. Software Engineer Intern' },
    { name: 'company', title: 'Company', type: 'string', validation: (R: any) => R.required() },
    { name: 'url', title: 'Company URL', type: 'url', description: 'Clicking the company on the site opens this' },
    { name: 'period', title: 'Period', type: 'string', description: 'Free text, e.g. "2024 - present" or "Jun - Sep 2025"' },
    {
      name: 'bullets',
      title: 'What you did',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'One line per bullet: what you built/owned and what it changed',
    },
    {
      name: 'skills',
      title: 'Skills',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'Shown as small pills under the bullets on /work, e.g. "FastAPI", "PostgreSQL"',
    },
    { name: 'sort', title: 'Sort order', type: 'number', initialValue: 0, description: 'Lower shows first; put the most recent role at the top' },
  ],
  preview: {
    select: { title: 'role', subtitle: 'company' },
  },
  orderings: [{ title: 'Sort order', name: 'sort', by: [{ field: 'sort', direction: 'asc' }] }],
};
