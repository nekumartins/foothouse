export default {
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    { name: 'bio', title: 'Bio', type: 'text', rows: 3, description: 'One-liner shown under your name' },
    { name: 'thesis', title: 'Thesis line', type: 'string', description: 'One quiet sentence under the one-liner' },
    { name: 'contact_email', title: 'Contact email', type: 'string' },
    { name: 'linkedin', title: 'LinkedIn URL', type: 'url' },
    { name: 'github', title: 'GitHub URL', type: 'url' },
    { name: 'twitter', title: 'Twitter / X URL', type: 'url' },
    { name: 'instagram', title: 'Instagram URL', type: 'url' },
    { name: 'resume', title: 'Resume (PDF)', type: 'file' },
    { name: 'about_video_url', title: 'About page video URL', type: 'url', description: 'YouTube video shown on the About page' },
  ],
};
