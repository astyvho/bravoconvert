import type { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3,
  Cookie,
  Database,
  Globe,
  Lock,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  UserCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | BravoConvert",
  description: "How BravoConvert processes files locally and how Google Analytics and Google AdSense may use cookies and usage data.",
  alternates: { canonical: "/privacy-policy" },
};

const sections = [
  {
    title: "Files you convert",
    body: "Images and PDF files selected in BravoConvert are processed locally in your browser. BravoConvert does not upload, receive, or store the contents of those files on its servers. Closing or refreshing the page clears the working session, although downloaded files remain on your device.",
  },
  {
    title: "Analytics and technical information",
    body: "We use Google Analytics to understand site usage and improve the service. Google may process information such as pages visited, approximate location derived from IP address, browser and device information, referring pages, and interaction events. This information is separate from the files you convert; file contents are not sent to Analytics.",
  },
  {
    title: "Advertising and cookies",
    body: "We use Google AdSense. Google and its advertising partners may use cookies, web beacons, IP addresses, or similar identifiers to provide, personalize, measure, and limit advertising. Third-party vendors, including Google, may use advertising cookies based on visits to this and other websites. Advertising tags never receive the contents of files selected for conversion.",
  },
  {
    title: "Consent and your choices",
    body: "Where required, a consent message allows you to accept, reject, or manage advertising and analytics choices. You may also block or delete cookies in your browser. You can manage personalized Google advertising at My Ad Center. Withdrawing consent does not affect processing that occurred before withdrawal.",
  },
  {
    title: "Third-party services",
    body: "Google Analytics and Google AdSense are provided by Google. Their processing is governed by Google's own privacy terms. External links are governed by the privacy policies of their operators. We do not sell the files you convert or disclose their contents to advertisers.",
  },
  {
    title: "Retention and security",
    body: "BravoConvert does not retain converted file contents. Analytics and advertising data may be retained by Google according to the settings and policies of those services. Browser-based processing reduces file exposure, but no internet service or device can be guaranteed completely secure.",
  },
  {
    title: "Your rights and contact",
    body: "Depending on your location, you may have rights to access, correct, delete, restrict, or object to processing of personal information. For privacy questions, email bravoconvert.help@gmail.com. We may need your email and message content to respond to your request.",
  },
];

const sectionIcons = [Lock, BarChart3, Cookie, SlidersHorizontal, Globe, Database, UserCheck];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <article className="max-w-4xl mx-auto bg-white rounded-2xl p-6 md:p-10 shadow-lg border border-gray-200">
        <header className="mb-10">
          <h1 className="mb-4 flex items-center gap-4 text-4xl font-bold text-black md:text-5xl">
            <ShieldCheck className="h-10 w-10 flex-shrink-0 text-gray-700 md:h-12 md:w-12" aria-hidden="true" />
            Privacy Policy
          </h1>
          <p className="text-gray-700">Effective and last updated: July 17, 2026</p>
        </header>

        <div className="mb-8 rounded-xl bg-blue-50 border border-blue-200 p-5 text-gray-800">
          <strong>Important distinction:</strong> files are converted locally and are not uploaded to BravoConvert, while normal website analytics and advertising technologies may process usage and device information.
        </div>

        <div className="space-y-9">
          {sections.map((section, index) => {
            const SectionIcon = sectionIcons[index];

            return (
            <section key={section.title}>
              <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
                <SectionIcon className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
                {index + 1}. {section.title}
              </h2>
              <p className="text-gray-700 leading-7">{section.body}</p>
              {section.title === "Consent and your choices" && (
                <p className="mt-3 text-gray-700">
                  Visit <a className="underline font-medium" href="https://myadcenter.google.com/" rel="noopener noreferrer" target="_blank">Google My Ad Center</a> to manage Google advertising preferences.
                </p>
              )}
              {section.title === "Third-party services" && (
                <p className="mt-3 text-gray-700">
                  Learn <a className="underline font-medium" href="https://policies.google.com/technologies/partner-sites" rel="noopener noreferrer" target="_blank">how Google uses information from partner sites</a>.
                </p>
              )}
            </section>
            );
          })}
        </div>

        <section className="mt-10 pt-8 border-t border-gray-200">
          <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
            <RefreshCw className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
            8. Changes to this policy
          </h2>
          <p className="text-gray-700 leading-7">We may update this policy when the service or applicable requirements change. The current effective date will be shown at the top of this page.</p>
          <p className="mt-4 text-gray-700">Questions? See our <Link className="underline font-medium" href="/contact">contact page</Link>.</p>
        </section>
      </article>
    </main>
  );
}
