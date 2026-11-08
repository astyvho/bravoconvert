import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, CheckCircle2, FlaskConical, Image as ImageIcon, Layers, Lightbulb, XCircle } from "lucide-react";
import benchmarks from "@/data/format-benchmarks.json";

const PUBLISHED = "2026-07-28";
const UPDATED = benchmarks.generatedAt;

export const metadata: Metadata = {
  title: "JPG vs PNG vs WebP: Measured File Size Comparison | BravoConvert",
  description:
    "We encoded three test images at four quality levels in the same browser engine BravoConvert uses and measured every byte. The results show where WebP wins, where it loses to JPG, and when PNG is the wrong choice.",
  alternates: { canonical: "/guides/jpg-png-webp-comparison/" },
  openGraph: {
    title: "JPG vs PNG vs WebP: Measured File Size Comparison",
    description:
      "Real byte counts from Canvas encoding, not rules of thumb — including the case where JPG beats WebP.",
    type: "article",
    publishedTime: PUBLISHED,
    modifiedTime: UPDATED,
  },
};

const kb = (bytes: number) => `${Math.round(bytes / 1024).toLocaleString()} KB`;

const sampleImages: Record<string, string> = {
  photo: "/guides/sample-photo.webp",
  graphic: "/guides/sample-graphic.webp",
  detail: "/guides/sample-detail.webp",
};

/** Pull a specific measurement out of the generated dataset. */
function at(sampleId: string, codec: "jpeg" | "webp", quality: number) {
  const sample = benchmarks.samples.find((s) => s.id === sampleId)!;
  return sample[codec].find((entry) => entry.quality === quality)!.bytes;
}

function pngOf(sampleId: string) {
  return benchmarks.samples.find((s) => s.id === sampleId)!.png;
}

const findings = [
  {
    title: "Saving a photograph as PNG costs about 15× the bytes",
    body: `The photographic sample is ${kb(pngOf("photo"))} as a PNG and ${kb(
      at("photo", "jpeg", 0.8)
    )} as a JPG at quality 0.8 — roughly ${Math.round(pngOf("photo") / at("photo", "jpeg", 0.8))}× larger for a difference most viewers will not notice at normal size. PNG has to record every grain of sensor noise exactly; JPG is allowed to approximate it.`,
  },
  {
    title: "For flat graphics, JPG is close to pointless",
    body: `On the dashboard-style sample, PNG is ${kb(pngOf("graphic"))} and JPG quality 0.8 is ${kb(
      at("graphic", "jpeg", 0.8)
    )}. You give up lossless accuracy and gain only about ${Math.round(
      (1 - at("graphic", "jpeg", 0.8) / pngOf("graphic")) * 100
    )}% — while introducing ringing around the text and chart edges. WebP at the same quality is ${kb(
      at("graphic", "webp", 0.8)
    )}, which is the setting worth reaching for.`,
  },
  {
    title: "WebP is not always smaller — this is the part most guides skip",
    body: `On the dense high-frequency sample at quality 0.4, JPG produced ${kb(
      at("detail", "jpeg", 0.4)
    )} and WebP produced ${kb(at("detail", "webp", 0.4))}. WebP was about ${Math.round(
      (at("detail", "webp", 0.4) / at("detail", "jpeg", 0.4) - 1) * 100
    )}% larger. At quality 0.8 the two are within a percent of each other. WebP's advantage is real on smooth and flat content, and it narrows or reverses on noisy texture.`,
  },
  {
    title: "The top of the quality slider is expensive",
    body: `Moving the photographic sample from quality 0.8 to 0.95 takes it from ${kb(
      at("photo", "jpeg", 0.8)
    )} to ${kb(at("photo", "jpeg", 0.95))} — about ${(
      at("photo", "jpeg", 0.95) / at("photo", "jpeg", 0.8)
    ).toFixed(1)}× the file for the last sliver of the scale. Most of those bytes go toward preserving grain and noise rather than detail you would miss.`,
  },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "JPG vs PNG vs WebP: Measured File Size Comparison",
  description:
    "Measured byte counts for JPG, PNG, and WebP across three content types and four quality levels, encoded in the same browser engine BravoConvert uses.",
  datePublished: PUBLISHED,
  dateModified: UPDATED,
  author: { "@type": "Organization", name: "BravoConvert" },
  publisher: { "@type": "Organization", name: "BravoConvert" },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://bravoconvert.com/guides/jpg-png-webp-comparison/",
  },
  image: "https://bravoconvert.com/guides/jpeg-quality-ladder.webp",
};

export default function JpgPngWebpGuide() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="mb-4 flex items-center justify-center text-4xl font-bold text-black md:text-6xl">
            <BarChart3 className="mr-4 h-16 w-16 flex-shrink-0 text-gray-700" aria-hidden="true" />
            JPG vs PNG vs WebP
          </h1>
          <p className="mb-4 text-xl text-black">We measured it instead of guessing</p>
          <p className="text-base text-gray-600">
            Every number on this page came out of the same encoder BravoConvert runs in your browser
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Published <time dateTime={PUBLISHED}>{PUBLISHED}</time> · Updated{" "}
            <time dateTime={UPDATED}>{UPDATED}</time>
          </p>
        </header>

        <article className="space-y-10 rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl md:p-10">
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-5 text-gray-800">
            <strong>Quick answer:</strong> use JPG for photographs headed somewhere that has to accept
            them, PNG when you need transparency or exact pixels, and WebP when you control the
            destination and want the smallest file. The measurements below show where that advice
            holds and where it breaks down.
          </div>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <FlaskConical className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              How these numbers were produced
            </h2>
            <p className="text-gray-700 leading-7 mb-4">
              Most format comparisons quote ratios without saying where they came from. These came from
              a script in this project that draws three deterministic {benchmarks.samples[0].width}×
              {benchmarks.samples[0].height} test images, encodes each one through the Canvas{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm">toBlob</code> API at four
              quality settings, and records the exact byte count of every result.
            </p>
            <p className="text-gray-700 leading-7 mb-4">
              That matters because <strong>it is the same code path the Image Converter uses</strong>.
              When this page says a photo lands at {kb(at("photo", "webp", 0.8))} as WebP, that is what
              BravoConvert would actually hand you, not a figure borrowed from another tool with a
              different encoder.
            </p>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              Measured on Chromium {benchmarks.engine} on {UPDATED}. Encoder output can shift slightly
              between browser versions, so treat these as representative rather than permanent
              constants. The test images are synthetic and drawn from a fixed random seed, which keeps
              the run reproducible — but it also means your own photos will land on different absolute
              numbers. The <em>relationships</em> between formats are what transfer.
            </div>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <Layers className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              Why the three formats behave differently
            </h2>
            <p className="text-gray-700 leading-7 mb-4">
              PNG compresses losslessly. It looks for patterns it can describe more compactly — runs of
              identical pixels, rows that resemble the row above — and rebuilds the original exactly.
              Nothing is thrown away, so re-saving a PNG a hundred times leaves it identical. The
              catch is that photographic noise has no pattern to exploit, so PNG ends up storing it
              nearly verbatim.
            </p>
            <p className="text-gray-700 leading-7 mb-4">
              JPG compresses lossily. It splits the image into blocks, converts each into frequency
              components, and rounds off the high-frequency ones your eye weights least. The quality
              slider controls how aggressively it rounds. This works beautifully on smooth gradients
              and poorly on hard edges, which is why text and line art picked up halos in the flat
              graphic test.
            </p>
            <p className="text-gray-700 leading-7">
              WebP offers both modes and generally makes smarter decisions than JPG at the same
              nominal quality — but &ldquo;generally&rdquo; is doing real work in that sentence, as the
              fine-detail measurements show.
            </p>
          </section>

          <section>
            <h2 className="mb-5 flex items-center gap-3 text-2xl font-bold text-black">
              <BarChart3 className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              The measurements
            </h2>

            <div className="space-y-10">
              {benchmarks.samples.map((sample) => (
                <div key={sample.id}>
                  <h3 className="mb-1 text-xl font-bold text-black">{sample.label}</h3>
                  <p className="mb-4 text-sm text-gray-600">{sample.description}</p>

                  <img
                    src={sampleImages[sample.id]}
                    width={sample.width}
                    height={sample.height}
                    alt={`${sample.label} test image: ${sample.description.toLowerCase()}`}
                    className="mb-4 h-auto w-full rounded-lg border border-gray-200"
                    loading="lazy"
                  />

                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-100 text-black">
                        <tr>
                          <th className="p-3 font-bold">Quality</th>
                          <th className="p-3 font-bold">JPG</th>
                          <th className="p-3 font-bold">WebP</th>
                          <th className="p-3 font-bold">Smaller format</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700">
                        {sample.jpeg.map((entry) => {
                          const webpBytes = sample.webp.find((w) => w.quality === entry.quality)!.bytes;
                          const webpWins = webpBytes < entry.bytes;
                          const delta = Math.abs(
                            Math.round((1 - Math.min(webpBytes, entry.bytes) / Math.max(webpBytes, entry.bytes)) * 100)
                          );
                          return (
                            <tr key={entry.quality} className="border-t border-gray-200">
                              <td className="p-3 font-medium text-black">{entry.quality}</td>
                              <td className="p-3">{kb(entry.bytes)}</td>
                              <td className="p-3">{kb(webpBytes)}</td>
                              <td className="p-3">
                                <span className="font-medium text-black">
                                  {webpWins ? "WebP" : "JPG"}
                                </span>{" "}
                                <span className="text-gray-500">by {delta}%</span>
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="border-t-2 border-gray-300 bg-gray-50">
                          <td className="p-3 font-medium text-black">PNG (lossless)</td>
                          <td className="p-3 font-medium text-black" colSpan={3}>
                            {kb(sample.png)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-3 text-2xl font-bold text-black">
              <Lightbulb className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              What the numbers actually tell you
            </h2>
            <div className="space-y-5">
              {findings.map((finding, index) => (
                <div key={finding.title} className="rounded-lg border-l-4 border-black bg-gray-50 p-5">
                  <h3 className="mb-2 flex items-start gap-3 text-lg font-bold text-black">
                    <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-black to-gray-800 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    {finding.title}
                  </h3>
                  <p className="pl-9 text-gray-700 leading-7">{finding.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-black">What JPG quality actually looks like</h2>
            <p className="text-gray-700 leading-7 mb-4">
              Quality settings are easier to judge by eye than by number. Below is the same crop of the
              photographic sample encoded at each quality level and magnified 2× so the difference is
              visible at reading size.
            </p>
            <img
              src="/guides/jpeg-quality-ladder.webp"
              width={2104}
              height={434}
              alt="The same photo crop encoded at JPG quality 0.4, 0.6, 0.8 and 0.95, magnified two times, with the file size of each"
              className="h-auto w-full rounded-lg border border-gray-200"
              loading="lazy"
            />
            <p className="mt-4 text-gray-700 leading-7">
              The visible change is not blockiness — it is grain. At quality 0.4 the encoder smooths
              the sensor noise away and the crop lands near 3 KB. At 0.95 that noise is faithfully
              preserved and the same crop costs roughly seven times as much. If your source is a noisy
              photo, a high quality setting is largely spending bytes on the noise.
            </p>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <ImageIcon className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              Transparency support
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                <div className="mb-2 flex items-center gap-2 font-bold text-black">
                  <XCircle className="h-5 w-5 text-gray-500" /> JPG
                </div>
                <p className="text-sm text-gray-700">
                  No alpha channel at all. Transparent pixels have to be filled with a background color
                  on export, which is why a logo saved as JPG arrives on a solid rectangle.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                <div className="mb-2 flex items-center gap-2 font-bold text-black">
                  <CheckCircle2 className="h-5 w-5 text-gray-700" /> PNG
                </div>
                <p className="text-sm text-gray-700">
                  Full 8-bit alpha, so edges stay smooth against any background. The safe default for
                  logos, icons, and screenshots with transparency.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                <div className="mb-2 flex items-center gap-2 font-bold text-black">
                  <CheckCircle2 className="h-5 w-5 text-gray-700" /> WebP
                </div>
                <p className="text-sm text-gray-700">
                  Alpha in both its lossy and lossless modes — the reason a transparent WebP is usually
                  far smaller than the equivalent PNG.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-black">Choosing a format</h2>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-black">
                  <tr>
                    <th className="p-3 font-bold">If your image is…</th>
                    <th className="p-3 font-bold">Choose</th>
                    <th className="p-3 font-bold">Because</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-t border-gray-200">
                    <td className="p-3">A photo for a website you control</td>
                    <td className="p-3 font-medium text-black">WebP, quality 0.8</td>
                    <td className="p-3">Smallest file at a quality difference you will not see</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="p-3">A photo for upload, email, or print</td>
                    <td className="p-3 font-medium text-black">JPG, quality 0.8</td>
                    <td className="p-3">Universally accepted; near-identical size to WebP here</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="p-3">A logo, icon, or screenshot with transparency</td>
                    <td className="p-3 font-medium text-black">PNG</td>
                    <td className="p-3">Lossless alpha and no artifacts around text or edges</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="p-3">A flat graphic or UI capture for the web</td>
                    <td className="p-3 font-medium text-black">WebP</td>
                    <td className="p-3">
                      {kb(at("graphic", "webp", 0.8))} against {kb(pngOf("graphic"))} for PNG on our
                      sample
                    </td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="p-3">Dense texture at an aggressive compression level</td>
                    <td className="p-3 font-medium text-black">Test both</td>
                    <td className="p-3">JPG can beat WebP here; the usual assumption fails</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-black">Compatibility</h2>
            <p className="text-gray-700 leading-7">
              JPG and PNG are accepted essentially everywhere. WebP is supported by every current
              browser, but older software, some printers, and certain upload forms still reject it. If
              a destination refuses a WebP file, converting it to JPG or PNG in the{" "}
              <Link className="underline font-medium" href="/convert/img/">
                Image Converter
              </Link>{" "}
              resolves it — and since the conversion runs in your browser, the file never leaves your
              device.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-black">Check the numbers yourself</h2>
            <p className="text-gray-700 leading-7 mb-4">
              The uncompressed PNG originals used for every measurement above are published here. Drop
              one into the converter, try the settings this page describes, and compare the byte count
              your browser produces against ours.
            </p>
            <ul className="space-y-2 text-gray-700">
              {benchmarks.samples.map((sample) => (
                <li key={sample.id}>
                  <a
                    className="underline font-medium"
                    href={`/guides/sample-${sample.id}.png`}
                    download
                  >
                    {sample.label} original (PNG, {kb(sample.png)})
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <p className="text-gray-700">
              Ready to convert? Use the{" "}
              <Link className="underline font-medium" href="/convert/img/">
                Image Converter
              </Link>{" "}
              to switch between JPG, PNG, and WebP, or read{" "}
              <Link className="underline font-medium" href="/guides/reduce-image-file-size/">
                how to reduce file size
              </Link>{" "}
              for more control over quality settings.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
