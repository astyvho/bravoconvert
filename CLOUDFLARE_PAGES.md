# Cloudflare Pages deployment

This project is configured as a static Next.js export. Image and PDF conversion happens in the visitor's browser, so no server, database, or paid storage is required.

## Create the Pages project

1. Sign in to the Cloudflare dashboard.
2. Open **Workers & Pages** and select **Create application**.
3. Select **Pages**, then **Import an existing Git repository**.
4. Connect GitHub and select `astyvho/bravoconvert`.
5. Use these build settings:

   - Production branch: `main`
   - Framework preset: `Next.js (Static HTML Export)`
   - Build command: `npm run build`
   - Build output directory: `out`
   - Root directory: leave empty

6. Select **Save and Deploy**.

Cloudflare will provide a temporary `*.pages.dev` address. Every push to `main` will trigger a new production deployment.

## Connect bravoconvert.com

1. Open the Pages project and select **Custom domains**.
2. Select **Set up a custom domain** and enter `bravoconvert.com`.
3. Add `www.bravoconvert.com` as a second custom domain if it is used.
4. Follow Cloudflare's DNS instructions. Do not remove the existing Vercel domain until the Pages deployment has been verified.

## Verify before switching DNS

- Open the Pages preview URL.
- Test JPG, PNG, WebP, and PDF conversion.
- Check `/ads.txt`, `/robots.txt`, `/sitemap.xml`, and `/feed.xml`.
- Confirm that navigation and direct page refreshes work.
- Only then switch the production domain from Vercel to Cloudflare Pages.
