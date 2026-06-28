export default {
  name: 'place',
  title: 'Place',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string', validation: (R: any) => R.required() },
    {
      name: 'lat',
      title: 'Latitude',
      type: 'number',
      description: 'Right-click a spot in Google Maps to copy lat, lng. This is the first number.',
      validation: (R: any) => R.required(),
    },
    {
      name: 'lng',
      title: 'Longitude',
      type: 'number',
      description: 'The second number from Google Maps.',
      validation: (R: any) => R.required(),
    },
    {
      name: 'arrived_on',
      title: 'Arrived on',
      type: 'date',
      description: 'Orders the faint travel route line between travel pins.',
    },
    {
      name: 'kind',
      title: 'Kind',
      type: 'string',
      options: { list: ['home', 'travel', 'event'] },
      initialValue: 'travel',
      description: 'Sets the pin color: home (amber), travel (ember), event (taupe).',
    },
    {
      name: 'pin_type',
      title: 'Pin type',
      type: 'string',
      options: { list: ['place', 'moment'] },
      initialValue: 'place',
      description: 'place = opens a photo gallery. moment = a single shot that enlarges.',
    },
    { name: 'note', title: 'Note', type: 'string', description: 'One line shown in the pin popup.' },
    { name: 'sort', title: 'Sort order', type: 'number', initialValue: 0 },
    {
      name: 'media',
      title: 'Photos',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'image', title: 'Image', type: 'image', options: { hotspot: true } },
            { name: 'caption', title: 'Caption', type: 'string' },
            { name: 'taken_on', title: 'Taken on', type: 'date' },
          ],
          preview: {
            select: { title: 'caption', media: 'image' },
          },
        },
      ],
    },
  ],
  orderings: [{ title: 'Sort order', name: 'sort', by: [{ field: 'sort', direction: 'asc' }] }],
};
