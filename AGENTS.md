# Repository Instructions

## Cloudflare deployment (mandatory)

BravoConvert is a fully static Next.js export. Every deployment must publish the generated `out` directory as Cloudflare Workers Static Assets.

- Keep `output: 'export'` in `next.config.js`.
- Keep `wrangler.jsonc` committed, with `assets.directory` set to `./out`.
- Do not deploy `.next` and do not let Wrangler auto-configure this project as an OpenNext/server-rendered Next.js application.
- Do not add `@opennextjs/cloudflare` or use `opennextjs-cloudflare build` unless the project is intentionally migrated away from static export and the user explicitly approves that architecture change.
- Before committing a deployment change, run `npm run build` and confirm that `out` exists and contains the exported site.
- Validate the Cloudflare configuration with `npx wrangler deploy --dry-run`; it must report that it read files from the `out` assets directory.
- The Cloudflare build command is `npm run build`. The deploy command is `npx wrangler deploy`.
- After pushing to `main`, verify the newest Cloudflare build and the production URLs. A successful local Next.js build alone does not prove deployment succeeded.

If a deployment log says the output directory is `.next`, or Wrangler starts an OpenNext migration, stop and fix the static-assets configuration before deploying.
