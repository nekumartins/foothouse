// Sanity Studio config — used by `npx sanity dev` and `npx sanity deploy`.
// Install the Studio: npm install -D sanity @sanity/vision
// Create a project at sanity.io, then replace the projectId below.
// Deploy hosted Studio: npx sanity deploy

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './src/sanity/schemas';

export default defineConfig({
  name: 'foothouse',
  title: 'Foothouse',
  projectId: 'qsm1xsj2',
  dataset: process.env.SANITY_DATASET || 'production',
  plugins: [structureTool()],
  schema: { types: schemaTypes },
});
