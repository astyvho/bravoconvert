import type { Metadata } from "next";
import Link from "next/link";
import { Bug, Copyright, LifeBuoy, ShieldCheck } from "lucide-react";
import ContactEmail from "@/components/ContactEmail";

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
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <article className="max-w-3xl mx-auto bg-white rounded-2xl p-6 md:p-10 shadow-lg border border-gray-200">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact</h1>
        <p className="text-gray-700 leading-7 mb-8">For technical support, privacy requests, copyright concerns, or feedback, contact us by email. Please do not attach private or sensitive source files; describe the issue and include only the browser, file format, and error message needed for troubleshooting.</p>

        <div className="space-y-4 mb-8">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.title} className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <h2 className="mb-2 flex items-center gap-3 text-lg font-bold text-black">
                  <Icon className="h-5 w-5 flex-shrink-0 text-gray-700" aria-hidden="true" />
                  {cat.title}
                </h2>
                <p className="text-sm text-gray-700 leading-6">{cat.body}</p>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl bg-gray-50 border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-2">Email</h2>
          <ContactEmail />
          <p className="text-sm text-gray-600 mt-3">Typical response time: a few business days, longer for complex requests.</p>
        </div>

        <section className="mt-8">
          <h2 className="mb-3 text-xl font-bold text-black">What makes a report easy to act on</h2>
          <p className="mb-4 text-gray-700 leading-7">
            Because everything runs inside your browser rather than on a server, there are no logs to
            look at from this end. A problem can usually only be reproduced from what you describe, so
            these four details do most of the work:
          </p>
          <ol className="list-decimal space-y-2 pl-6 text-gray-700 leading-7">
            <li>Your browser and version, and whether you were on a phone or a computer.</li>
            <li>
              The real format and rough size of the file — not the extension, which can be misleading.
              A file renamed from <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm">.heic</code>{" "}
              to <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm">.jpg</code> is still HEIC,
              and that alone explains a lot of rejections.
            </li>
            <li>Which tool you used and what settings were showing when it went wrong.</li>
            <li>The exact wording of any message, and what you expected to happen instead.</li>
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-xl font-bold text-black">Please do not send files</h2>
          <p className="text-gray-700 leading-7">
            There is no facility here for receiving them, and the whole point of the site is that your
            documents stay on your own device — mailing one in would undo that. Describe the file
            instead. If a problem only happens with one specific image, saying so is more useful than
            attaching it: it usually points at the format or the dimensions rather than the picture.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-xl font-bold text-black">What we cannot help with</h2>
          <p className="text-gray-700 leading-7">
            Recovering a file you did not keep a copy of — nothing is stored here, so there is nothing
            to retrieve. Converting formats the tools do not accept, such as HEIC, RAW, TIFF or GIF.
            Anything requiring an account, since there are none. And restoring quality lost to an
            earlier compression: once detail has been discarded by a lossy encoder, no amount of
            re-converting brings it back.
          </p>
        </section>

        <p className="text-sm text-gray-600 mt-8">
          Many common questions are already answered in the <Link className="underline font-medium" href="/faq/">FAQ</Link> and the <Link className="underline font-medium" href="/guides/troubleshooting/">troubleshooting guide</Link>. For what the site does with data, see the <Link className="underline font-medium" href="/privacy-policy/">privacy policy</Link>; for who runs it, see <Link className="underline font-medium" href="/about/">about</Link>.
        </p>
      </article>
    </main>
  );
}
