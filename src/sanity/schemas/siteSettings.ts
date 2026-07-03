export default {
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    { name: 'bio', title: 'Bio', type: 'text', rows: 3, description: 'One-liner shown under your name' },
    { name: 'looking_for', title: 'Looking for', type: 'string', description: 'One quiet line on what you are open to (roles, collaborations). Not a "Hire me" badge.' },
    { name: 'stack', title: 'Tech stack', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' }, description: 'The languages/tools you actually work in, shown as a small row on the homepage.' },
    { name: 'contact_email', title: 'Contact email', type: 'string' },
    { name: 'linkedin', title: 'LinkedIn URL', type: 'url' },
    { name: 'github', title: 'GitHub URL', type: 'url' },
    { name: 'twitter', title: 'Twitter / X URL', type: 'url' },
    { name: 'instagram', title: 'Instagram URL', type: 'url' },
    { name: 'resume', title: 'Resume (PDF)', type: 'file' },
    { name: 'featured_video_url', title: 'Featured video URL', type: 'url', description: 'YouTube video featured on the homepage. Leave empty; the section only renders once set.' },
    { name: 'about_video_url', title: 'About page video URL', type: 'url', description: 'YouTube video shown on the About page' },
  ],
};
