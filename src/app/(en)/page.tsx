import type { Metadata } from "next";
import Link from "next/link";
import { alternatesFor } from "@/lib/locale";
import HomePhotoDrop from "@/components/HomePhotoDrop";
import { Camera, Check, CircleAlert, Clock, Eraser, FileSearch, Fingerprint, Gauge, Image, ListChecks, MapPin, PenLine, Share2, ShieldCheck, User } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PageContainer from "@/components/site/page-container";
import IconTile from "@/components/tool/icon-tile";
import StatusBadge from "@/components/tool/status-badge";
import ReportPanel from "@/components/tool/report-panel";
import HeroStage from "@/components/home/hero-stage";
import StepCard from "@/components/home/step-card";
import ToolCard from "@/components/home/tool-card";
import { OTHER_TOOLS as otherTools, OTHER_TOOL_TONES } from "@/components/home/other-tools";
import TaskCard from "@/components/home/task-card";
import RevealItem from "@/components/home/reveal-item";
import { demoReport, demoReportCounts } from "@/lib/demo-report";
import { cn } from "@/lib/utils";
import benchmarks from "@/data/format-benchmarks.json";
import exifDemo from "@/data/exif-demo.json";

const kb = (bytes: number) => `${Math.round(bytes / 1024).toLocaleString()} KB`;
const homePhoto = benchmarks.samples.find((s) => s.id === "photo")!;
const homeJpg80 = homePhoto.jpeg.find((e) => e.quality === 0.8)!.bytes;
const homeWebp80 = homePhoto.webp.find((e) => e.quality === 0.8)!.bytes;
const homeHalf = benchmarks.resize.rows.find((r) => r.scale === 0.5)!;

// exif-demo.json 의 필드명을 사람이 읽는 이름으로. 값은 스크립트가 만든 샘플 사진의 실제 값이다.
const demoLabels: Record<string, string> = {
  Make: "Camera make",
  Model: "Camera model",
  DateTimeOriginal: "Date and time taken",
  Orientation: "Orientation",
  latitude: "GPS latitude",
  longitude: "GPS longitude",
  GPSLatitudeRef: "Latitude hemisphere",
  GPSLongitudeRef: "Longitude hemisphere",
};

const revealed = [
  { icon: MapPin, label: "Where it was taken", body: "GPS coordinates precise enough to find a house, written by phones whose camera app has location access." },
  { icon: Clock, label: "When it was taken", body: "The date and time to the second, which can place you somewhere at a moment you did not mention." },
  { icon: Camera, label: "What took it", body: "The make and model of the phone or camera, and sometimes the lens." },
  { icon: Fingerprint, label: "Which device exactly", body: "Some cameras write a body serial number, which ties every photo back to one physical device." },
  { icon: User, label: "Who owns it", body: "An owner, artist or copyright name, if the camera or editing app was set up with one." },
  { icon: PenLine, label: "What edited it", body: "The software that last saved the file, and on some systems the name of the computer." },
];

const steps = [
  {
    icon: FileSearch,
    title: "1. Check",
    body: "See which of six kinds of hidden information the photo carries, down to the GPS point.",
    href: "/view/exif/",
    cta: "Check a photo",
  },
  {
    icon: Eraser,
    title: "2. Clean",
    body: "Remove it now gives you a copy without it. Several photos? Remove from all.",
    href: "/view/exif/?sample=1",
    cta: "Try it on a sample",
  },
  {
    icon: Share2,
    title: "3. Confirm and share",
    body: "The copy is checked again automatically. Street signs and faces are yours to check.",
    href: "/guides/exif-metadata-privacy/",
    cta: "Read what we tested",
  },
];

const commonTasks = [
  {
    task: "A photo is about to be posted publicly",
    how: "Check it in the EXIF viewer to see whether it carries a location, time, or device details. If it does, convert it: the output is rebuilt from pixels, so none of that carries over.",
    tool: "EXIF Viewer",
    href: "/view/exif/",
  },
  {
    task: "Selling something online with a photo taken at home",
    how: "Listing photos taken in your own home can carry your home's coordinates. Convert them before uploading, then check one of the results to confirm the location is gone.",
    tool: "Image Converter",
    href: "/convert/img/",
  },
  {
    task: "A document is too confidential to upload anywhere",
    how: "Merge, split, or render it here: the PDF is opened by your own browser and never sent to a server, so there is no copy of it anywhere but your device.",
    tool: "Merge & Split PDF",
    href: "/edit/pdf/",
  },
  {
    task: "Someone needs one page of a long PDF",
    how: "Extract that page as its own PDF so the rest of the document does not travel with it. If it has to open anywhere without a PDF viewer, render it as a PNG image instead.",
    tool: "Merge & Split PDF",
    href: "/edit/pdf/",
  },
  {
    task: "A photo is too big to email or upload",
    how: "Resize it down first, then convert to JPG or WebP at quality 0.8. The export is a new file, so the original's EXIF block is not copied into it either.",
    tool: "Image Editor",
    href: "/edit/image/",
  },
  {
    task: "A form only accepts JPG or PNG",
    how: "Convert the file and download the result. Batch conversion returns a ZIP when there is more than one file.",
    tool: "Image Converter",
    href: "/convert/img/",
  },
];


export const metadata: Metadata = {
  alternates: alternatesFor("/", "en"),
};

const STEP_TONES = ["blue", "yellow", "green"] as const;
const TH = "p-3 text-left text-sm font-bold text-foreground";
const TD = "p-3 text-sm tabular-nums";
const INLINE_LINK = "font-semibold text-primary underline-offset-4 hover:underline";

export default function Home() {
  const report = demoReport("en");
  const counts = demoReportCounts("en");
  const survived = exifDemo.after.filter((f) => f.value !== null).length;

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "BravoConvert",
            url: "https://bravoconvert.com",
            description: "Check what a photo reveals before you share it, and clean it without uploading it. Browser-based photo metadata, image and PDF tools.",
            publisher: {
              "@type": "Organization",
              name: "BravoConvert",
              url: "https://bravoconvert.com/",
              email: "bravoconvert.help@gmail.com",
            },
            hasPart: [
              { "@type": "WebApplication", name: "EXIF Viewer", applicationCategory: "UtilitiesApplication", operatingSystem: "Any browser", url: "https://bravoconvert.com/view/exif/", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
              { "@type": "WebApplication", name: "Image Converter", applicationCategory: "MultimediaApplication", operatingSystem: "Any browser", url: "https://bravoconvert.com/convert/img/", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
              { "@type": "WebApplication", name: "PDF to Image Converter", applicationCategory: "MultimediaApplication", operatingSystem: "Any browser", url: "https://bravoconvert.com/convert/pdf/", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
              { "@type": "WebApplication", name: "Image Editor", applicationCategory: "MultimediaApplication", operatingSystem: "Any browser", url: "https://bravoconvert.com/edit/image/", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
              { "@type": "WebApplication", name: "PDF Merge and Split", applicationCategory: "UtilitiesApplication", operatingSystem: "Any browser", url: "https://bravoconvert.com/edit/pdf/", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
            ],
          }),
        }}
      />
      <PageContainer>
        {/* Hero: copy and actions left, the sample "photo" with its findings right. */}
        <section className="grid items-center gap-10 pt-6 lg:grid-cols-[1.05fr_.95fr] lg:gap-12 lg:pt-14">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3.5 py-1.5 text-caption text-foreground">
              Free · private · right in your browser
            </span>
            <h1 className="mt-5 text-[36px] font-extrabold leading-[1.1] tracking-tight text-foreground lg:text-display">
              Check what a photo reveals before you share it
            </h1>
            <p className="mt-5 max-w-[520px] text-lg leading-relaxed text-muted-foreground">
              Photos often carry the place they were taken, the time, and the phone that took them. Check yours and share only the picture.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/view/exif/" className={buttonVariants({ size: "lg" })}>Check a photo</Link>
              <Link href="/view/exif/?sample=1" className={buttonVariants({ variant: "secondary", size: "lg" })}>Try the sample</Link>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-semibold text-muted-foreground">
              {["Nothing is uploaded", "No sign-up", "Clean copy in one tap"].map((item) => (
                <li key={item} className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-status-clean-foreground" aria-hidden="true" />{item}</li>
              ))}
            </ul>
          </div>
          <HeroStage locale="en" />
        </section>

        <section className="mt-12 lg:mt-16">
          <HomePhotoDrop locale="en" />
        </section>

        {/* What a report looks like: the real sample photo and its measured findings. */}
        <section className="mt-20">
          <div className="mx-auto max-w-[560px] text-center">
            <h2 className="text-h2 text-foreground">Here&apos;s what we check</h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Six things a photo can quietly say about you. The viewer checks each one and tells you in plain words what it found.
            </p>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-[300px_1fr]">
            <Card className="relative min-h-[220px] overflow-hidden bg-tile-peach lg:min-h-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={exifDemo.sourceFile} alt="The sample photo used for this report" className="absolute inset-0 h-full w-full object-cover" />
              <span className="absolute bottom-4 left-4 rounded-full bg-card px-3 py-1.5 text-caption text-foreground shadow-soft">sample photo · {kb(exifDemo.sourceBytes)}</span>
            </Card>
            <ReportPanel
              data-testid="sample-report"
              title={`We found ${counts.found} things`}
              summary={<StatusBadge status="found">{counts.found} of {counts.total} found</StatusBadge>}
              items={report}
              rowBadge={(item) => <StatusBadge status={item.found ? "found" : "clean"}>{item.found ? "Found" : "Not present"}</StatusBadge>}
              footer={
                <>
                  <Link href="/view/exif/?sample=1" className={buttonVariants()}>Remove it now</Link>
                  <Link href="/view/exif/" className={buttonVariants({ variant: "secondary" })}>Check another</Link>
                  <span className="basis-full text-[13px] text-muted-foreground sm:ml-auto sm:basis-auto">We check the clean copy again for you.</span>
                </>
              }
            />
          </div>
        </section>

        {/* Check, clean, share */}
        <section className="mt-20">
          <h2 className="text-center text-h2 text-foreground">Three easy steps</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <StepCard
                key={step.title}
                index={`0${index + 1}`}
                icon={step.icon}
                tone={STEP_TONES[index]}
                title={step.title.replace(/^\d+\.\s*/, "")}
                body={step.body}
                href={step.href}
                cta={step.cta}
              />
            ))}
          </div>
        </section>

        <section className="mt-20 space-y-16">
          <div>
            <h2 className="flex items-center gap-3 text-h2 text-foreground">
              <IconTile icon={ShieldCheck} size="sm" tone="blue" className="hidden sm:inline-flex" />
              Tested, not assumed: what survives a conversion
            </h2>
            <p className="mt-4 max-w-[760px] leading-7 text-muted-foreground">
              We built a sample photo carrying {exifDemo.before.length} metadata fields — {exifDemo.exifBlockBytes} bytes that
              no one sees when looking at the picture — then put it through the same decode-and-redraw path the converter
              uses and read the result back with an EXIF parser.
            </p>
            <Card className="mt-6 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <caption className="caption-top border-b border-border p-4 text-left">
                    <StatusBadge status={exifDemo.anyFieldSurvived ? "found" : "clean"}>
                      {exifDemo.anyFieldSurvived ? `After conversion: ${survived} left` : `After conversion: all ${exifDemo.before.length} gone`}
                    </StatusBadge>
                  </caption>
                  <thead className="bg-muted/60">
                    <tr><th className={TH}>Field</th><th className={TH}>Value in the original</th></tr>
                  </thead>
                  <tbody>
                    {exifDemo.before.map((row, index) => (
                      <tr key={row.field} className="border-t border-border">
                        <td className={cn(TD, "font-semibold text-foreground")}>{demoLabels[row.field] ?? row.field}</td>
                        <td className={cn(TD, "text-muted-foreground")}>
                          {exifDemo.after[index].value === null ? (
                            <s>{String(row.value)}</s>
                          ) : (
                            <>{String(row.value)} <StatusBadge status="found" className="ml-1">kept</StatusBadge></>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <p className="mt-4 max-w-[760px] leading-7 text-muted-foreground">
              {exifDemo.anyFieldSurvived ? "Some fields survived." : "None of the fields survived."} The sample is a real file
              with made-up details, and you can{" "}
              <Link href="/view/exif/" className={INLINE_LINK}>open it in the viewer</Link> yourself. The{" "}
              <Link href="/guides/exif-metadata-privacy/" className={INLINE_LINK}>EXIF privacy guide</Link>{" "}
              covers the full test and what removing metadata does not protect you from.
            </p>
          </div>

          <div>
            <h2 className="text-h2 text-foreground">What a photo can say about you</h2>
            <p className="mt-4 max-w-[760px] leading-7 text-muted-foreground">
              These are the six things the EXIF Viewer looks for. A photo rarely carries all of them, and which ones appear
              depends on the device and its settings rather than on the picture.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {revealed.map((item) => <RevealItem key={item.label} icon={item.icon} label={item.label} body={item.body} />)}
            </div>
          </div>

          <div>
            <h2 className="text-h2 text-foreground">Tools that keep files on your device</h2>
            <p className="mt-4 max-w-[760px] leading-7 text-muted-foreground">
              The other tools do everyday image and PDF work the same way: the file is opened by your browser and the result
              is handed back as a download, so there is never a copy on someone else&apos;s server.
            </p>
            <div data-testid="tool-cards" className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {otherTools.map((tool, index) => (
                <ToolCard key={tool.href} icon={tool.icon} tone={OTHER_TOOL_TONES[index]} title={tool.title} points={tool.points} body={tool.use} href={tool.href} cta="Open" />
              ))}
            </div>
          </div>

          <div>
            <h2 className="flex items-center gap-3 text-h2 text-foreground">
              <IconTile icon={ListChecks} size="sm" tone="blue" className="hidden sm:inline-flex" />
              Common tasks, and where to start
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {commonTasks.map((task) => <TaskCard key={task.task} task={task.task} how={task.how} tool={task.tool} href={task.href} />)}
            </div>
          </div>

          <div className="max-w-[760px]">
            <h2 className="flex items-center gap-3 text-h2 text-foreground">
              <IconTile icon={CircleAlert} size="sm" tone="yellow" className="hidden sm:inline-flex" />
              What removing metadata does not do
            </h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Converting removes the information stored alongside the picture. It does nothing about the picture itself: a
              street sign, a house number, a face, a reflection in a window or a screen in the background can identify a
              place or a person just as well as GPS coordinates. Look at the image before you share it.
            </p>
            <p className="mt-3 leading-7 text-muted-foreground">
              The tools accept JPG, PNG and WebP images and PDF documents. HEIC photos from an iPhone, RAW, TIFF, GIF and BMP are not
              accepted. Keep your
              originals: converting makes a copy and nothing is stored here after you close the tab. If something fails,{" "}
              <Link href="/guides/troubleshooting/" className={INLINE_LINK}>troubleshooting</Link> lists the usual causes.
            </p>
          </div>

          <div>
            <h2 className="flex items-center gap-3 text-h2 text-foreground">
              <IconTile icon={Gauge} size="sm" tone="green" className="hidden sm:inline-flex" />
              Also measured: what conversion does to file size
            </h2>
            <Card className="mt-6 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/60">
                    <tr>
                      <th className={TH}>Same 900×600 photo, saved as</th>
                      <th className={TH}>Size</th>
                      <th className={TH}>Against the PNG</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-t border-border">
                      <td className={cn(TD, "font-semibold text-foreground")}>PNG (lossless)</td>
                      <td className={TD}>{kb(homePhoto.png)}</td>
                      <td className={cn(TD, "text-muted-foreground/60")}>—</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className={cn(TD, "font-semibold text-foreground")}>JPG, quality 0.8</td>
                      <td className={TD}>{kb(homeJpg80)}</td>
                      <td className={TD}>{Math.round((1 - homeJpg80 / homePhoto.png) * 100)}% smaller</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className={cn(TD, "font-semibold text-foreground")}>WebP, quality 0.8</td>
                      <td className={TD}>{kb(homeWebp80)}</td>
                      <td className={TD}>{Math.round((1 - homeWebp80 / homePhoto.png) * 100)}% smaller</td>
                    </tr>
                    <tr className="border-t border-border bg-muted/40">
                      <td className={cn(TD, "font-semibold text-foreground")}>WebP at half the dimensions</td>
                      <td className={cn(TD, "font-semibold text-foreground")}>{kb(homeHalf.webp)}</td>
                      <td className={cn(TD, "font-semibold text-foreground")}>{Math.round((1 - homeHalf.webp / homePhoto.png) * 100)}% smaller</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
            <p className="mt-4 max-w-[760px] leading-7 text-muted-foreground">
              The <Link href="/guides/jpg-png-webp-comparison/" className={INLINE_LINK}>format comparison guide</Link>{" "}
              publishes every measurement and the test images themselves, including the case where JPG beats WebP.
            </p>
          </div>

          <Card className="p-6">
            <h2 className="text-h3 text-foreground">More in the guides</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              The <Link href="/guides/" className={INLINE_LINK}>guides section</Link> starts with what EXIF metadata
              reveals and how we tested its removal, what a PDF says about who made it, and also covers choosing between JPG, PNG and WebP, reducing file size,
              PDF output resolution, and fixes for common problems.
            </p>
          </Card>
        </section>
      </PageContainer>
    </main>
  );
}
