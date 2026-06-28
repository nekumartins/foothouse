export default {
  name: 'now',
  title: 'Now',
  type: 'document',
  fields: [
    { name: 'listening_text', title: 'Listening (fallback)', type: 'string', description: 'Shown when Spotify is offline' },
    { name: 'reading_title', title: 'Reading — Title', type: 'string' },
    { name: 'reading_author', title: 'Reading — Author', type: 'string' },
    { name: 'reading_cover', title: 'Reading — Cover Image', type: 'image' },
    { name: 'reading_note', title: 'Reading — Note', type: 'string', description: 'e.g. "slowly, on purpose"' },
    { name: 'building_text', title: 'Building (fallback)', type: 'string', description: 'Shown when GitHub is offline' },
    { name: 'status_line', title: 'Lately', type: 'string', description: 'What you are up to right now' },
  ],
};
