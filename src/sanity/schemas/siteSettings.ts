export default {
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    { name: 'bio', title: 'Bio', type: 'text', rows: 3, description: 'One-liner shown under your name' },
    { name: 'contact_email', title: 'Contact email', type: 'string' },
    { name: 'linkedin', title: 'LinkedIn URL', type: 'url' },
    { name: 'github', title: 'GitHub URL', type: 'url' },
    { name: 'twitter', title: 'Twitter / X URL', type: 'url' },
    { name: 'instagram', title: 'Instagram URL', type: 'url' },
    { name: 'resume', title: 'Resume (PDF)', type: 'file' },
    { name: 'featured_video_url', title: 'Featured video URL', type: 'url', description: 'YouTube embed URL' },
  ],
};
