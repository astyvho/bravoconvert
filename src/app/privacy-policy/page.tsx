import type { Metadata } from "next";
import Link from "next/link";
import ContactEmail from "@/components/ContactEmail";
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
  alternates: { canonical: "/privacy-policy/" },
};

const sections = [
  {
    title: "Files you convert",
    body: "Images and PDF files selected for viewing, editing, or conversion in BravoConvert are processed locally in your browser. BravoConvert does not upload, receive, or store the contents of those files on its servers. Closing or refreshing the page clears the working session, although downloaded files remain on your device. The one exception is a link you choose to click: when the EXIF viewer finds GPS coordinates in a photo, its optional \"Show on OpenStreetMap\" link opens openstreetmap.org with those coordinates in the address, under OpenStreetMap's own privacy policy. Nothing is sent unless you click it.",
  },
  {
    title: "Analytics and technical information",
    body: "The Google Analytics tag is present on every page of bravoconvert.com and loads when the page loads. What it is permitted to do depends on your consent: until you select Accept optional cookies, Google Consent Mode holds analytics storage in a denied state, so the tag does not read or write analytics cookies or identifiers on your device. Google still receives the request itself, which necessarily includes your IP address and browser user agent. After you accept, Analytics may additionally process pages visited, approximate location derived from IP address, browser and device information, referring pages, and interaction events. BravoConvert requests IP anonymization in its Analytics configuration. File contents and image pixels are never sent to Analytics.",
  },
  {
    title: "Advertising and cookies",
    body: "Third party vendors, including Google, use cookies to serve ads based on a user's prior visits to bravoconvert.com or other websites. The Google AdSense script is present on every page and loads when the page loads. Until you accept, Consent Mode holds ad storage, advertising user data, and ad personalization in a denied state, so Google and its partners do not store or read advertising cookies or similar identifiers on your device and do not use your data to personalize ads. Requests to Google's ad servers still occur and necessarily carry your IP address and user agent. After you accept, Google and its advertising partners may use cookies, local storage, web beacons, IP addresses, or similar identifiers to serve, personalize, limit, and measure advertising. Whether personalized, non-personalized, or limited ads are available depends on your region, consent signals, Google requirements, and the site's AdSense configuration. File contents and image pixels are never passed to the AdSense tag.",
  },
  {
    title: "Consent and your choices",
    body: "The Privacy choices panel stores either granted or denied in your browser's local storage under bravoconvert-consent-v1. The default Google Consent Mode state is denied for analytics storage, ad storage, advertising user data, and ad personalization. Accepting updates all four signals to granted. Rejecting leaves all four denied — the Google tags remain loaded, but they are not permitted to use storage on your device for analytics or advertising, and ads are not personalized. This is Google's documented Consent Mode design: the tag loads and then respects the signal, rather than the signal deciding whether the tag loads at all. You can reopen Privacy choices at any time. A later rejection updates future consent signals but does not undo earlier processing or automatically delete cookies already stored, which you can remove in browser settings.",
  },
  {
    title: "Third-party services",
    body: "Google Analytics and Google AdSense are provided by Google. BravoConvert has not opted out of third-party ad serving, so vendors and ad networks other than Google may also serve ads on this site through Google's advertising partners. Those vendors set and read their own cookies and identifiers under their own privacy policies, and you can review the participating networks and opt out of their personalized advertising at the links below. For ad requests from the EEA, the UK, and Switzerland, Google requires publishers serving personalized ads to use a Google-certified CMP integrated with the IAB Transparency and Consent Framework. That certified Google or third-party CMP is configured through the AdSense account and is distinct from BravoConvert's site-level Privacy choices panel. Google may restrict ad serving when a required certified CMP signal is unavailable. External links follow their operators' privacy policies. BravoConvert does not sell selected file contents or disclose them to advertisers.",
  },
  {
    title: "Retention and security",
    body: "BravoConvert does not retain converted file contents. Your consent choice remains in local storage until you change it, clear site data, or use another browser or device. Analytics and advertising data may be retained by Google according to the applicable account settings and Google policies. Browser-based file processing reduces exposure but cannot guarantee complete security.",
  },
  {
    title: "Your rights and contact",
    body: "Depending on your location, you may have rights to access, correct, delete, restrict, or object to processing of personal information. We may need your email address and message content in order to respond to your request.",
  },
];

const sectionIcons = [Lock, BarChart3, Cookie, SlidersHorizontal, Globe, Database, UserCheck];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="mb-4 flex items-center justify-center text-4xl font-bold text-black md:text-6xl">
            <ShieldCheck className="mr-4 h-16 w-16 flex-shrink-0 text-gray-700" aria-hidden="true" />
            Privacy Policy
          </h1>
          <p className="mb-8 text-xl text-black">How BravoConvert handles files, analytics, and advertising data</p>
          <p className="text-base text-gray-600">Effective and last updated: October 13, 2026</p>
        </header>

        <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl md:p-10">

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
              {section.title === "Your rights and contact" && (
                <p className="mt-3 text-gray-700">
                  For privacy questions, email <ContactEmail className="underline font-medium text-gray-700" />.
                </p>
              )}
              {section.title === "Advertising and cookies" && (
                <p className="mt-3 text-gray-700">
                  You can opt out of personalized advertising by Google at <a className="underline font-medium" href="https://www.google.com/settings/ads" rel="noopener noreferrer" target="_blank">Google Ads Settings</a>, and opt out of personalized advertising by other participating vendors and ad networks at <a className="underline font-medium" href="https://www.aboutads.info/choices/" rel="noopener noreferrer" target="_blank">www.aboutads.info</a>.
                </p>
              )}
              {section.title === "Third-party services" && (
                <p className="mt-3 text-gray-700">
                  Learn <a className="underline font-medium" href="https://policies.google.com/technologies/partner-sites" rel="noopener noreferrer" target="_blank">how Google uses information from partner sites</a>, review the vendors listed at <a className="underline font-medium" href="https://www.aboutads.info/choices/" rel="noopener noreferrer" target="_blank">www.aboutads.info</a>, or opt out through the <a className="underline font-medium" href="https://optout.networkadvertising.org/" rel="noopener noreferrer" target="_blank">Network Advertising Initiative</a>.
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
          <p className="mt-4 text-gray-700">Questions? See our <Link className="underline font-medium" href="/contact/">contact page</Link>.</p>
        </section>
        </article>
      </div>
    </main>
  );
}
