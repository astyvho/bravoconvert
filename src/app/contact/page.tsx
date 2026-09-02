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

        <p className="text-sm text-gray-600 mt-6">
          Many common questions are already answered in the <Link className="underline font-medium" href="/faq/">FAQ</Link> and the <Link className="underline font-medium" href="/guides/troubleshooting/">troubleshooting guide</Link>.
        </p>
      </article>
    </main>
  );
}
