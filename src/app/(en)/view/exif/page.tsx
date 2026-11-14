import type { Metadata } from "next";
import { alternatesFor } from "@/lib/locale";
import Link from "next/link";
import { CircleAlert, EyeOff, FileSearch, FlaskConical, MapPin, ShieldCheck } from "lucide-react";
import ExifViewer from "@/components/ExifViewer";
import PageContainer from "@/components/site/page-container";
import AdSlot from "@/components/tool/ad-slot";
import IconTile from "@/components/tool/icon-tile";
import Prose from "@/components/tool/prose";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import demo from "@/data/exif-demo.json";

export const metadata: Metadata = {
  alternates: alternatesFor("/view/exif/", "en"),
  title: "EXIF Viewer - Check Photo Metadata and GPS Location Without Uploading | BravoConvert",
  description: "See the hidden metadata in a JPG, PNG, or WebP photo — GPS location, date taken, camera, serial number — before you share it. The photo is read in your browser and never uploaded.",
  keywords: ["exif viewer", "photo metadata viewer", "check photo location", "hidden exif data", "remove gps from photo", "image metadata"],
  openGraph: {
    title: "EXIF Viewer — See What Your Photo Reveals",
    description: "Check a photo's GPS location, date, and device details without uploading it.",
    type: "website",
  },
};


// 1초(위도) = 지구 둘레 / 360 / 3600 ≈ 30.9 m
const METRES_PER_ARCSECOND = 30.9;

export default function ExifViewerPage() {
  const beforeFields = demo.before.filter(item => item.value !== null);
  const survived = demo.after.filter(item => item.value !== null);
  const sizeChange = Math.round((demo.convertedBytes / demo.sourceBytes - 1) * 100);

  return (
    <main>
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

      <PageContainer className="pb-16">
        <AdSlot slot="exif-below-tool" />
        <article data-fold className="mt-12">
          <Prose>
          <header>
          <h2>
            <IconTile icon={FileSearch} size="sm" tone="blue" className="hidden sm:inline-flex" />
            What a photo can say about you
          </h2>
          <p>
            Alongside the picture, most camera and phone photos carry a block of text called EXIF: notes the device writes about how and where the shot was taken. None of it is visible when you look at the image, and much of it is harmless — exposure, lens, white balance. Six kinds of field are not harmless once a photo leaves your hands, and they are what the privacy check above looks for:
          </p>
          <ul>
            <li><strong>Location.</strong> GPS coordinates of where the photo was taken. A picture taken at home and posted publicly can reveal the address.</li>
            <li><strong>Date and time.</strong> When the shot was taken, to the second. A series of photos can sketch out a routine.</li>
            <li><strong>Device model.</strong> The make and model of the camera or phone.</li>
            <li><strong>Serial number.</strong> Some cameras record their own serial number, which can link photos posted under different names back to one device.</li>
            <li><strong>Owner or author name.</strong> Cameras and editing apps can stamp a name or copyright line into every file.</li>
            <li><strong>Editing software.</strong> The app that last saved the file, which can contradict a claim that a photo is unedited.</li>
          </ul>
        </header>
          </Prose>
          <Accordion className="mt-8 max-w-[880px]">
            <AccordionItem heading="h2" icon={MapPin} tone="blue" question="How precise the location in a photo is">
              <Prose className="max-w-none [&>*:first-child]:!mt-0">
          <p>
            GPS coordinates are stored as degrees, minutes, and seconds. One second of latitude is about {Math.round(METRES_PER_ARCSECOND)} metres north to south, so a photo that records whole seconds — as our sample does — already places you within a single building. Coordinates stored with fractions of a second narrow it further, to a few metres. The viewer shows coordinates to five decimal places, which is a resolution of roughly one metre; the real accuracy depends on the GPS fix the device had when the photo was taken, and indoors it is often worse.
          </p>
          <p>
            The &ldquo;Show on OpenStreetMap&rdquo; link is the only part of this page that sends anything anywhere, and only when you click it: the coordinates go to openstreetmap.org so it can draw the map.
          </p>
        
              </Prose>
            </AccordionItem>
            <AccordionItem heading="h2" icon={FlaskConical} tone="blue" question="What we tested">
              <Prose className="max-w-none [&>*:first-child]:!mt-0">
          <p>
            The &ldquo;Try a sample photo&rdquo; button loads a JPEG we built with a real EXIF block: an invented camera called {String(demo.before.find(item => item.field === "Make")?.value)} {String(demo.before.find(item => item.field === "Model")?.value)}, a capture time, a rotation flag, and the coordinates of Trafalgar Square — a public landmark, chosen so the sample points nowhere private. It carries {beforeFields.length} metadata fields in a {demo.exifBlockBytes}-byte block.
          </p>
          <p>
            We then pushed that file through the same decode-and-redraw path the <Link href="/convert/img/?from=exif">Image Converter</Link> uses and read the result back with the same parser this viewer uses. {survived.length === 0 ? `None of the ${beforeFields.length} fields survived` : `${survived.length} of the ${beforeFields.length} fields survived`}, GPS included. One thing surprised us: the cleaned file was {sizeChange > 0 ? `${sizeChange}% larger` : `${Math.abs(sizeChange)}% smaller`} than the original ({demo.sourceBytes.toLocaleString("en-US")} bytes before, {demo.convertedBytes.toLocaleString("en-US")} after), because re-encoding the picture costs more than the small metadata block it removed. Removing metadata is a privacy step, not a way to make files smaller. The full experiment is written up in the <Link href="/guides/exif-metadata-privacy/">EXIF and privacy guide</Link>.
          </p>
        
              </Prose>
            </AccordionItem>
            <AccordionItem heading="h2" icon={ShieldCheck} tone="blue" question="Why this viewer never uploads the photo">
              <Prose className="max-w-none [&>*:first-child]:!mt-0">
          <p>
            An online metadata checker that uploads your photo sends the very information you are trying to check — your location, your device — to someone else&apos;s server. This one reads the file inside your browser. The image is opened from your device, its metadata is decoded in memory, and closing the tab discards it.
          </p>
          <p>
            Each format keeps its metadata in a different place. JPEG stores EXIF in a segment near the start of the file, PNG in a chunk named <code className="rounded bg-muted px-1.5 py-0.5 text-sm text-foreground">eXIf</code>, and WebP in a chunk named <code className="rounded bg-muted px-1.5 py-0.5 text-sm text-foreground">EXIF</code> inside its RIFF container. The parsing library this tool uses reads JPEG and PNG but not WebP, so for WebP files the viewer finds the EXIF chunk itself and hands its contents to the parser. We checked all three formats with the same metadata block and got the same fields back from each.
          </p>
        
              </Prose>
            </AccordionItem>
            <AccordionItem heading="h2" icon={EyeOff} tone="blue" question="What metadata cannot tell you">
              <Prose className="max-w-none [&>*:first-child]:!mt-0">
          <ul>
            <li><strong>What is in the picture.</strong> A clean result here does not mean the photo is anonymous. Street signs, house numbers, reflections, and faces are part of the pixels, and no metadata tool will flag them.</li>
            <li><strong>Manufacturer notes.</strong> Many cameras add a proprietary &ldquo;maker note&rdquo; in their own undocumented format. This viewer does not decode it, so a camera-specific detail stored only there will not appear.</li>
            <li><strong>Embedded thumbnails.</strong> Some cameras store a small preview image inside the file. If the photo was cropped in an app that did not update that preview, the preview can still show the uncropped original. The viewer does not extract it; converting the file with the Image Converter removes it along with everything else.</li>
            <li><strong>Other formats.</strong> The viewer accepts JPG, PNG, and WebP, the same formats as the rest of BravoConvert.</li>
          </ul>
        
              </Prose>
            </AccordionItem>
            <AccordionItem heading="h2" icon={CircleAlert} tone="blue" question="Troubleshooting">
              <Prose className="max-w-none [&>*:first-child]:!mt-0">
          <ul>
            <li><strong>&ldquo;No identifying metadata found&rdquo; on a phone photo.</strong> The app that last saved the file — a messaging app, a screenshot tool, an editor — may already have removed it. Check the original from the camera roll if you need to know what it contained.</li>
            <li><strong>Location is missing on a photo you expected to have it.</strong> Location tagging can be switched off in the camera settings, and photos taken indoors may have had no GPS fix.</li>
            <li><strong>The file is rejected.</strong> Only JPG, PNG, and WebP up to 25 MB are accepted.</li>
          </ul>
          <p>
            For questions, see the <Link href="/faq/">FAQ</Link> or the <Link href="/contact/">contact page</Link> — but please do not send the photo itself.
          </p>
        
              </Prose>
            </AccordionItem>
          </Accordion>
        </article>
      </PageContainer>
    </main>
  );
}
