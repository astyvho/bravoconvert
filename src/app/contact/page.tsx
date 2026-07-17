import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact BravoConvert",
  description: "Contact BravoConvert for support, privacy, copyright, or service questions.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <article className="max-w-3xl mx-auto bg-white rounded-2xl p-6 md:p-10 shadow-lg border border-gray-200">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact</h1>
        <p className="text-gray-700 leading-7 mb-8">For technical support, privacy requests, copyright concerns, or feedback, contact us by email. Please do not attach private or sensitive source files; describe the issue and include only the browser, file format, and error message needed for troubleshooting.</p>
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-2">Email</h2>
          <a className="text-blue-700 underline font-medium" href="mailto:bravoconvert.help@gmail.com">bravoconvert.help@gmail.com</a>
          <p className="text-sm text-gray-600 mt-3">Typical response time: 1–4 weeks.</p>
        </div>
      </article>
    </main>
  );
}
