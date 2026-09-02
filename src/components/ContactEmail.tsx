export const CONTACT_EMAIL = "bravoconvert.help@gmail.com";

/**
 * Renders the contact address in a way Cloudflare will leave alone.
 *
 * Cloudflare's Scrape Shield rewrites any plain-text email address in the
 * served HTML into a `[email protected]` placeholder wrapped in a
 * `/cdn-cgi/l/email-protection#...` link, and that link 404s. A visitor or
 * crawler without JavaScript therefore sees a placeholder where the contact
 * address should be, and a broken link if they click it — on the two pages
 * whose whole purpose is being reachable.
 *
 * The documented opt-out is a pair of `email_off` HTML comments around the
 * region. JSX has no way to emit a real HTML comment, so the markup is written
 * out directly. The content is a hard-coded constant with no user input, and
 * the address is escaped for the attribute context regardless.
 */
export default function ContactEmail({
  className = "text-blue-700 underline font-medium",
  asLink = true,
}: {
  className?: string;
  asLink?: boolean;
}) {
  const safe = CONTACT_EMAIL.replace(/"/g, "&quot;");
  const inner = asLink
    ? `<a href="mailto:${safe}" class="${className}">${CONTACT_EMAIL}</a>`
    : CONTACT_EMAIL;

  return (
    <span
      dangerouslySetInnerHTML={{
        __html: `<!--email_off-->${inner}<!--/email_off-->`,
      }}
    />
  );
}
