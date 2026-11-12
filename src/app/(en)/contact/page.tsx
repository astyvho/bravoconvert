import type { Metadata } from "next";
import Link from "next/link";
import { Bug, Copyright, LifeBuoy, ShieldCheck } from "lucide-react";
import ContactEmail from "@/components/ContactEmail";
import ContentHeader from "@/components/content/content-header";
import IconTile from "@/components/tool/icon-tile";
import Prose from "@/components/tool/prose";

export const metadata: Metadata = {
  title: "Contact BravoConvert",
  description: "Contact BravoConvert for support, privacy, copyright, or service questions.",
  alternates: { canonical: "/contact/" },
};

const categories = [
  {
    icon: Bug,
    title: "Bug reports and technical issues",
    body: "Include your browser and version, the file format and approximate size involved, and the exact error message or behavior you saw. See the troubleshooting guide first — it covers the most common cases.",
  },
  {
    icon: LifeBuoy,
    title: "Feature requests and feedback",
    body: "Tell us what you were trying to do and what was missing. Not every request can be built, but real usage context helps prioritize what to work on next.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy requests",
    body: "For questions about data handling, or to exercise applicable access, correction, or deletion rights, describe your request. See the Privacy Policy for what information the site actually processes.",
  },
  {
    icon: Copyright,
    title: "Copyright concerns",
    body: "If you believe content on this site infringes your rights, include the specific page URL and a description of the material in question.",
  },
];

export default function ContactPage() {
  return (
    <main>
      <div className="mx-auto w-full max-w-[1120px] px-4 pb-16 pt-6 sm:px-6">
        <ContentHeader label="Contact" title="Contact">
          <p className="mt-3 text-lg leading-relaxed text-foreground">For technical support, privacy requests, copyright concerns, or feedback, contact us by email. Please do not attach private or sensitive source files; describe the issue and include only the browser, file format, and error message needed for troubleshooting.</p>
        </ContentHeader>

        <Prose as="article" className="mt-10 space-y-10">
        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.title} className="rounded-card bg-card p-5 shadow-soft">
                <h2 className="!mt-0 !mb-2 !text-h3">
                  <IconTile icon={Icon} tone="blue" size="sm" />
                  {cat.title}
                </h2>
                <p className="!my-0 text-sm leading-6">{cat.body}</p>
              </div>
            );
          })}
        </div>

        <div className="rounded-card bg-primary-soft p-6">
          <h2 className="!mt-0 !mb-2 !text-h3">Email</h2>
          <ContactEmail />
          <p className="!mb-0 text-sm">Typical response time: a few business days, longer for complex requests.</p>
        </div>

        <section>
          <h2>What makes a report easy to act on</h2>
          <p>
            Because everything runs inside your browser rather than on a server, there are no logs to
            look at from this end. A problem can usually only be reproduced from what you describe, so
            these four details do most of the work:
          </p>
          <ol>
            <li>Your browser and version, and whether you were on a phone or a computer.</li>
            <li>
              The real format and rough size of the file — not the extension, which can be misleading.
              A file renamed from <code>.heic</code>{" "}
              to <code>.jpg</code> is still HEIC,
              and that alone explains a lot of rejections.
            </li>
            <li>Which tool you used and what settings were showing when it went wrong.</li>
            <li>The exact wording of any message, and what you expected to happen instead.</li>
          </ol>
        </section>

        <section>
          <h2>Please do not send files</h2>
          <p>
            There is no facility here for receiving them, and the whole point of the site is that your
            documents stay on your own device — mailing one in would undo that. Describe the file
            instead. If a problem only happens with one specific image, saying so is more useful than
            attaching it: it usually points at the format or the dimensions rather than the picture.
          </p>
        </section>

        <section>
          <h2>What we cannot help with</h2>
          <p>
            Recovering a file you did not keep a copy of — nothing is stored here, so there is nothing
            to retrieve. Converting formats the tools do not accept, such as HEIC, RAW, TIFF or GIF.
            Anything requiring an account, since there are none. And restoring quality lost to an
            earlier compression: once detail has been discarded by a lossy encoder, no amount of
            re-converting brings it back.
          </p>
        </section>

        <p className="text-sm">
          Many common questions are already answered in the <Link href="/faq/">FAQ</Link> and the <Link href="/guides/troubleshooting/">troubleshooting guide</Link>. For what the site does with data, see the <Link href="/privacy-policy/">privacy policy</Link>; for who runs it, see <Link href="/about/">about</Link>.
        </p>
        </Prose>
      </div>
    </main>
  );
}
