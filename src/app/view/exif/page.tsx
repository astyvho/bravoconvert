import type { Metadata } from "next";
import Link from "next/link";
import { CircleAlert, EyeOff, FileSearch, FlaskConical, MapPin, ShieldCheck } from "lucide-react";
import ExifViewer from "@/components/ExifViewer";
import demo from "@/data/exif-demo.json";

export const metadata: Metadata = {
  alternates: { canonical: "/view/exif/" },
  title: "EXIF Viewer - Check Photo Metadata and GPS Location Without Uploading | BravoConvert",
  description: "See the hidden metadata in a JPG, PNG, or WebP photo — GPS location, date taken, camera, serial number — before you share it. The photo is read in your browser and never uploaded.",
  keywords: ["exif viewer", "photo metadata viewer", "check photo location", "hidden exif data", "remove gps from photo", "image metadata"],
  openGraph: {
    title: "EXIF Viewer — See What Your Photo Reveals",
    description: "Check a photo's GPS location, date, and device details without uploading it.",
    type: "website",
  },
};

const SECTION = "flex items-center gap-3 text-2xl font-bold text-black";
const ICON = "h-7 w-7 flex-shrink-0 text-gray-700";

// 1초(위도) = 지구 둘레 / 360 / 3600 ≈ 30.9 m
const METRES_PER_ARCSECOND = 30.9;

export default function ExifViewerPage() {
  const beforeFields = demo.before.filter(item => item.value !== null);
  const survived = demo.after.filter(item => item.value !== null);
  const sizeChange = Math.round((demo.convertedBytes / demo.sourceBytes - 1) * 100);

  return (
    <main className="min-h-screen bg-white pt-2">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "BravoConvert EXIF Viewer",
            url: "https://bravoconvert.com/view/exif/",
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Any",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            featureList: ["Read EXIF, GPS, XMP, and IPTC metadata", "Privacy check for location, time, device, and owner", "JPG, PNG, and WebP", "Browser-only processing"],
          }),
        }}
      />
      <ExifViewer />

      <article className="mx-auto mt-8 max-w-4xl space-y-10 rounded-3xl border border-gray-200 bg-white p-6 text-gray-700 shadow-sm md:p-10">
        <header>
          <h2 className={SECTION}>
            <FileSearch className={ICON} aria-hidden="true" />
            What a photo can say about you
          </h2>
          <p className="mt-4 leading-7">
            Alongside the picture, most camera and phone photos carry a block of text called EXIF: notes the device writes about how and where the shot was taken. None of it is visible when you look at the image, and much of it is harmless — exposure, lens, white balance. Six kinds of field are not harmless once a photo leaves your hands, and they are what the privacy check above looks for:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6 leading-7">
            <li><strong className="text-black">Location.</strong> GPS coordinates of where the photo was taken. A picture taken at home and posted publicly can reveal the address.</li>
            <li><strong className="text-black">Date and time.</strong> When the shot was taken, to the second. A series of photos can sketch out a routine.</li>
            <li><strong className="text-black">Device model.</strong> The make and model of the camera or phone.</li>
            <li><strong className="text-black">Serial number.</strong> Some cameras record their own serial number, which can link photos posted under different names back to one device.</li>
            <li><strong className="text-black">Owner or author name.</strong> Cameras and editing apps can stamp a name or copyright line into every file.</li>
            <li><strong className="text-black">Editing software.</strong> The app that last saved the file, which can contradict a claim that a photo is unedited.</li>
          </ul>
        </header>

        <section>
          <h2 className={SECTION}>
            <MapPin className={ICON} aria-hidden="true" />
            How precise the location in a photo is
          </h2>
          <p className="mt-3 leading-7">
            GPS coordinates are stored as degrees, minutes, and seconds. One second of latitude is about {Math.round(METRES_PER_ARCSECOND)} metres north to south, so a photo that records whole seconds — as our sample does — already places you within a single building. Coordinates stored with fractions of a second narrow it further, to a few metres. The viewer shows coordinates to five decimal places, which is a resolution of roughly one metre; the real accuracy depends on the GPS fix the device had when the photo was taken, and indoors it is often worse.
          </p>
          <p className="mt-3 leading-7">
            The &ldquo;Show on OpenStreetMap&rdquo; link is the only part of this page that sends anything anywhere, and only when you click it: the coordinates go to openstreetmap.org so it can draw the map.
          </p>
        </section>

        <section>
          <h2 className={SECTION}>
            <FlaskConical className={ICON} aria-hidden="true" />
            What we tested
          </h2>
          <p className="mt-3 leading-7">
            The &ldquo;Try a sample photo&rdquo; button loads a JPEG we built with a real EXIF block: an invented camera called {String(demo.before.find(item => item.field === "Make")?.value)} {String(demo.before.find(item => item.field === "Model")?.value)}, a capture time, a rotation flag, and the coordinates of Trafalgar Square — a public landmark, chosen so the sample points nowhere private. It carries {beforeFields.length} metadata fields in a {demo.exifBlockBytes}-byte block.
          </p>
          <p className="mt-3 leading-7">
            We then pushed that file through the same decode-and-redraw path the <Link href="/convert/img/" className="font-medium text-black underline">Image Converter</Link> uses and read the result back with the same parser this viewer uses. {survived.length === 0 ? `None of the ${beforeFields.length} fields survived` : `${survived.length} of the ${beforeFields.length} fields survived`}, GPS included. One thing surprised us: the cleaned file was {sizeChange > 0 ? `${sizeChange}% larger` : `${Math.abs(sizeChange)}% smaller`} than the original ({demo.sourceBytes.toLocaleString("en-US")} bytes before, {demo.convertedBytes.toLocaleString("en-US")} after), because re-encoding the picture costs more than the small metadata block it removed. Removing metadata is a privacy step, not a way to make files smaller. The full experiment is written up in the <Link href="/guides/exif-metadata-privacy/" className="font-medium text-black underline">EXIF and privacy guide</Link>.
          </p>
        </section>

        <section>
          <h2 className={SECTION}>
            <ShieldCheck className={ICON} aria-hidden="true" />
            Why this viewer never uploads the photo
          </h2>
          <p className="mt-3 leading-7">
            An online metadata checker that uploads your photo sends the very information you are trying to check — your location, your device — to someone else&apos;s server. This one reads the file inside your browser. The image is opened from your device, its metadata is decoded in memory, and closing the tab discards it.
          </p>
          <p className="mt-3 leading-7">
            Each format keeps its metadata in a different place. JPEG stores EXIF in a segment near the start of the file, PNG in a chunk named <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm text-black">eXIf</code>, and WebP in a chunk named <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm text-black">EXIF</code> inside its RIFF container. The parsing library this tool uses reads JPEG and PNG but not WebP, so for WebP files the viewer finds the EXIF chunk itself and hands its contents to the parser. We checked all three formats with the same metadata block and got the same fields back from each.
          </p>
        </section>

        <section>
          <h2 className={SECTION}>
            <EyeOff className={ICON} aria-hidden="true" />
            What metadata cannot tell you
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 leading-7">
            <li><strong className="text-black">What is in the picture.</strong> A clean result here does not mean the photo is anonymous. Street signs, house numbers, reflections, and faces are part of the pixels, and no metadata tool will flag them.</li>
            <li><strong className="text-black">Manufacturer notes.</strong> Many cameras add a proprietary &ldquo;maker note&rdquo; in their own undocumented format. This viewer does not decode it, so a camera-specific detail stored only there will not appear.</li>
            <li><strong className="text-black">Embedded thumbnails.</strong> Some cameras store a small preview image inside the file. If the photo was cropped in an app that did not update that preview, the preview can still show the uncropped original. The viewer does not extract it; converting the file with the Image Converter removes it along with everything else.</li>
            <li><strong className="text-black">Other formats.</strong> The viewer accepts JPG, PNG, and WebP, the same formats as the rest of BravoConvert.</li>
          </ul>
        </section>

        <section>
          <h2 className={SECTION}>
            <CircleAlert className={ICON} aria-hidden="true" />
            Troubleshooting
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 leading-7">
            <li><strong className="text-black">&ldquo;No identifying metadata found&rdquo; on a phone photo.</strong> The app that last saved the file — a messaging app, a screenshot tool, an editor — may already have removed it. Check the original from the camera roll if you need to know what it contained.</li>
            <li><strong className="text-black">Location is missing on a photo you expected to have it.</strong> Location tagging can be switched off in the camera settings, and photos taken indoors may have had no GPS fix.</li>
            <li><strong className="text-black">The file is rejected.</strong> Only JPG, PNG, and WebP up to 25 MB are accepted.</li>
          </ul>
          <p className="mt-4 leading-7">
            For questions, see the <Link href="/faq/" className="font-medium text-black underline">FAQ</Link> or the <Link href="/contact/" className="font-medium text-black underline">contact page</Link> — but please do not send the photo itself.
          </p>
        </section>
      </article>
    </main>
  );
}
