# Sanity Studio

The content you edit (writing, projects, experience, the now-strip, map places,
site settings) lives in Sanity. The Studio is a small app defined by
`sanity.config.ts` + the schemas in `src/sanity/schemas/`.

## The one rule that bit us

**Editing content** in the Studio needs no deploy. But **changing the shape of
the content** (adding a new type like Experience, or turning a single image into
a photo array) only shows up after the Studio is rebuilt and redeployed. If you
added fields in this repo but do not see them in the Studio, it needs a redeploy.

## Deploy without a computer (from any browser, phone included)

A GitHub Action does the deploy on GitHub's servers. One-time setup:

1. Go to https://www.sanity.io/manage, open the **foothouse** project, then
   **API -> Tokens -> Add API token**. Name it "GitHub deploy", give it the
   **Deploy Studio** role, and copy the token.
2. In GitHub, open the repo **Settings -> Secrets and variables -> Actions ->
   New repository secret**. Name it `SANITY_AUTH_TOKEN`, paste the token, save.

After that, to redeploy any time: GitHub repo -> **Actions** tab -> **Deploy
Sanity Studio** -> **Run workflow**. It also runs automatically whenever the
schema changes on `main`. When it finishes green, refresh the Studio and the new
fields (Experience, the photo array, etc.) are there.

## Or run/deploy from a computer

```
npm run studio          # local Studio at http://localhost:3333
npm run studio:deploy   # rebuild + push the hosted Studio (project qsm1xsj2)
npm run studio:schema   # validate schemas without deploying
```

The local commands open a browser once to log you into Sanity.

## What is already in the schema and waiting for this deploy

- **Experience** (`experience.ts`): role, company, company URL, period, bullets,
  sort. Add entries here and they fill `/work` and the homepage strip.
- **Places → Photos** (`place.ts`): the `media` field is an array of images, so
  you can drag several photos onto a place at once and caption them after.
- **Site Settings**: craft line, About paragraphs, portrait, looking-for, stack.
