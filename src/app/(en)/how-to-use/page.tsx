import type { Metadata } from "next";
import ContentHeader from "@/components/content/content-header";
import { Upload, Image, FileText, Download, Zap, Shield, BookOpen, Archive, SlidersHorizontal, PencilRuler, RotateCw, Combine, Scissors, FileSearch, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "How to Use BravoConvert",
  description: "Step-by-step instructions for editing images, converting JPG, PNG and WebP files, rendering PDF pages as images, merging or splitting PDFs, and checking photo metadata.",
  alternates: { canonical: "/how-to-use/" },
};

export default function HowToUsePage() {
  return (
    <main>
      <div className="mx-auto w-full max-w-[1120px] px-4 pb-16 pt-6 sm:px-6">
        <ContentHeader label="How to use" title="How to Use">
          <p className="mt-3 text-lg leading-relaxed text-foreground">
            BravoConvert is really easy to use!
          </p>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            Convert or edit a file in just 3 steps
          </p>
        </ContentHeader>

        <div className="mt-10 max-w-[880px] space-y-8">

        {/* Image Converter Usage */}
        <div className="bg-card rounded-card p-8 shadow-soft">
          <h2 className="mb-6 flex items-center gap-3 text-h2 text-foreground">
            <span className="w-2 h-8 bg-primary rounded"></span>
            Image Converter
          </h2>
          
          <div className="space-y-6">
            <div className="bg-muted rounded-field p-6 border-l-4 border-primary hover:bg-muted">
              <h3 className="mb-4 flex items-center gap-3 text-xl font-bold text-foreground">
                <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  1
                </span>
                Upload Files
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed pl-12 flex items-start">
                <Upload className="w-6 h-6 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                Drag and drop or click to upload JPG/JPEG, PNG, or WebP images. Each image must be 10MB or smaller.
              </p>
            </div>

            <div className="bg-muted rounded-field p-6 border-l-4 border-primary hover:bg-muted">
              <h3 className="mb-4 flex items-center gap-3 text-xl font-bold text-foreground">
                <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  2
                </span>
                Select Format
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed pl-12 flex items-start">
                <Zap className="w-6 h-6 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                Choose your desired output format (PNG, JPG, WebP, PDF). You can also combine multiple images into a single PDF.
              </p>
            </div>

            <div className="bg-muted rounded-field p-6 border-l-4 border-primary hover:bg-muted">
              <h3 className="mb-4 flex items-center gap-3 text-xl font-bold text-foreground">
                <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  3
                </span>
                Download
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed pl-12 flex items-start">
                <Download className="w-6 h-6 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                Click the convert button and download your completed files. Multiple files are provided as a ZIP archive.
              </p>
            </div>
          </div>

          {/* Conversion Features Section */}
          <div className="mt-8 bg-primary-soft border border-transparent rounded-field p-6">
            <h4 className="text-lg font-bold text-foreground mb-4 flex items-center">
              <span className="mr-2">🎯</span>
              Useful Conversion Tools
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <SlidersHorizontal className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-foreground">Quality & File Size Controls</div>
                  <div className="text-sm text-muted-foreground">Adjust JPG and WebP quality or set an optional target size</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Archive className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-foreground">Batch Downloads</div>
                  <div className="text-sm text-muted-foreground">Convert multiple images and download the results together as ZIP</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-6 bg-muted rounded-field border border-border">
            <h4 className="text-lg font-bold text-foreground mb-3">Tips</h4>
            <ul className="text-base text-muted-foreground space-y-2">
              <li>• <strong className="text-foreground">Multiple Files:</strong> You can upload multiple images at once</li>
              <li>• <strong className="text-foreground">PDF Creation:</strong> Combine multiple images into a single PDF</li>
              <li>• <strong className="text-foreground">Compression:</strong> Adjust quality or choose a target size for JPG and WebP</li>
              <li>• <strong className="text-foreground">File Size:</strong> Each image supports up to 10MB</li>
            </ul>
          </div>
        </div>

        {/* PDF to Image Converter Usage */}
        <div className="bg-card rounded-card p-8 shadow-soft">
          <h2 className="mb-6 flex items-center gap-3 text-h2 text-foreground">
            <span className="w-2 h-8 bg-primary rounded"></span>
            PDF to Image Converter
          </h2>
          
          <div className="space-y-6">
            <div className="bg-muted rounded-field p-6 border-l-4 border-primary hover:bg-muted">
              <h3 className="mb-4 flex items-center gap-3 text-xl font-bold text-foreground">
                <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  1
                </span>
                Upload PDF
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed pl-12 flex items-start">
                <FileText className="w-6 h-6 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                Upload the PDF file you want to convert to images. Supports up to 50MB file size.
              </p>
            </div>

            <div className="bg-muted rounded-field p-6 border-l-4 border-primary hover:bg-muted">
              <h3 className="mb-4 flex items-center gap-3 text-xl font-bold text-foreground">
                <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  2
                </span>
                Select Format
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed pl-12 flex items-start">
                <Image className="w-6 h-6 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                Choose between JPG or PNG for your desired image format. JPG has smaller file sizes, while PNG offers better quality.
              </p>
            </div>

            <div className="bg-muted rounded-field p-6 border-l-4 border-primary hover:bg-muted">
              <h3 className="mb-4 flex items-center gap-3 text-xl font-bold text-foreground">
                <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  3
                </span>
                Convert & Download
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed pl-12 flex items-start">
                <Download className="w-6 h-6 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                Each page is converted to individual images and downloaded. Multiple pages are provided as a ZIP file.
              </p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-muted rounded-field border border-border">
            <h4 className="text-lg font-bold text-foreground mb-3">Tips</h4>
            <ul className="text-base text-muted-foreground space-y-2">
              <li>• <strong className="text-foreground">Page-by-Page:</strong> Each PDF page becomes a separate image file</li>
              <li>• <strong className="text-foreground">ZIP Archive:</strong> Multiple pages are bundled together for download</li>
              <li>• <strong className="text-foreground">Local Processing:</strong> PDF pages are rendered on your device</li>
              <li>• <strong className="text-foreground">File Size:</strong> PDFs support up to 50MB</li>
            </ul>
          </div>
        </div>

        {/* Image Editor Usage */}
        <div className="bg-card rounded-card p-8 shadow-soft">
          <h2 className="mb-6 flex items-center gap-3 text-h2 text-foreground">
            <span className="w-2 h-8 bg-primary rounded"></span>
            Image Editor
          </h2>
          <p className="mb-8 text-muted-foreground leading-7">Use the image editor when you need to change one image&apos;s dimensions or orientation. Use the image converter instead when you need batch conversion, ZIP downloads, compression targets, or an image-based PDF.</p>

          <div className="space-y-6">
            <div className="bg-muted rounded-field p-6 border-l-4 border-primary hover:bg-muted">
              <h3 className="mb-4 flex items-center gap-3 text-xl font-bold text-foreground">
                <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</span>
                Add One Image
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed pl-12 flex items-start">
                <Upload className="w-6 h-6 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                Drop, select, or paste a JPG, PNG, or WebP image. The file must be 10MB or smaller and is processed on your device.
              </p>
            </div>

            <div className="bg-muted rounded-field p-6 border-l-4 border-primary hover:bg-muted">
              <h3 className="mb-4 flex items-center gap-3 text-xl font-bold text-foreground">
                <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</span>
                Resize, Rotate, or Flip
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed pl-12 flex items-start">
                <RotateCw className="w-6 h-6 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                Enter exact pixel dimensions or use a percentage preset. Keep the aspect ratio locked to prevent stretching, then rotate or flip the preview as needed.
              </p>
            </div>

            <div className="bg-muted rounded-field p-6 border-l-4 border-primary hover:bg-muted">
              <h3 className="mb-4 flex items-center gap-3 text-xl font-bold text-foreground">
                <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</span>
                Export the Edited Image
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed pl-12 flex items-start">
                <Download className="w-6 h-6 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                Choose JPG, PNG, or WebP, set quality where available, enter a file name, and download the edited result. Choose a background color when exporting transparency to JPG.
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 rounded-field border border-border bg-muted p-6">
            <div className="flex items-start gap-3">
              <PencilRuler className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
              <div><div className="font-semibold text-foreground">Non-destructive preview</div><div className="text-sm text-muted-foreground">Undo, redo, or reset without changing the original file</div></div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
              <div><div className="font-semibold text-foreground">Local processing</div><div className="text-sm text-muted-foreground">The source image is not uploaded to BravoConvert</div></div>
            </div>
          </div>
        </div>

        {/* PDF Merge and Split Usage */}
        <div className="bg-card rounded-card p-8 shadow-soft">
          <h2 className="mb-6 flex items-center gap-3 text-h2 text-foreground">
            <span className="w-2 h-8 bg-primary rounded"></span>
            Merge &amp; Split PDF
          </h2>
          <p className="mb-8 text-muted-foreground leading-7">Use this tool to join PDFs or pull pages out of one while keeping the pages as real PDF content. Use the PDF to Image converter instead when you need each page as a JPG or PNG picture.</p>

          <div className="space-y-6">
            <div className="bg-muted rounded-field p-6 border-l-4 border-primary hover:bg-muted">
              <h3 className="mb-4 flex items-center gap-3 text-xl font-bold text-foreground">
                <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</span>
                Choose Merge or Split
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed pl-12 flex items-start">
                <Combine className="w-6 h-6 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                Merge combines up to 30 PDFs, each up to 50MB and 150MB in total. Split works on one PDF up to 50MB. Password-protected PDFs cannot be opened.
              </p>
            </div>

            <div className="bg-muted rounded-field p-6 border-l-4 border-primary hover:bg-muted">
              <h3 className="mb-4 flex items-center gap-3 text-xl font-bold text-foreground">
                <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</span>
                Set the Order or the Pages
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed pl-12 flex items-start">
                <Scissors className="w-6 h-6 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                When merging, use the arrows to put the files in reading order. When splitting, type pages and ranges such as 1-3, 5 — or choose to split every page into its own file.
              </p>
            </div>

            <div className="bg-muted rounded-field p-6 border-l-4 border-primary hover:bg-muted">
              <h3 className="mb-4 flex items-center gap-3 text-xl font-bold text-foreground">
                <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</span>
                Download the New PDF
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed pl-12 flex items-start">
                <Download className="w-6 h-6 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                Download the merged or extracted PDF, or a ZIP of single-page PDFs. Bookmarks and accessibility tags from the originals are not carried over, so check the result if you rely on them.
              </p>
            </div>
          </div>
        </div>

        {/* EXIF Viewer Usage */}
        <div className="bg-card rounded-card p-8 shadow-soft">
          <h2 className="mb-6 flex items-center gap-3 text-h2 text-foreground">
            <span className="w-2 h-8 bg-primary rounded"></span>
            EXIF Viewer
          </h2>
          <p className="mb-8 text-muted-foreground leading-7">Use the EXIF viewer to see what a photo reveals before you share it. It only reads the file; to remove what it finds, convert the photo with the Image Converter.</p>

          <div className="space-y-6">
            <div className="bg-muted rounded-field p-6 border-l-4 border-primary hover:bg-muted">
              <h3 className="mb-4 flex items-center gap-3 text-xl font-bold text-foreground">
                <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</span>
                Open a Photo
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed pl-12 flex items-start">
                <FileSearch className="w-6 h-6 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                Drop or choose a JPG, PNG, or WebP photo up to 25MB, or use the sample photo to see how a result looks.
              </p>
            </div>

            <div className="bg-muted rounded-field p-6 border-l-4 border-primary hover:bg-muted">
              <h3 className="mb-4 flex items-center gap-3 text-xl font-bold text-foreground">
                <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</span>
                Read the Privacy Check
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed pl-12 flex items-start">
                <ShieldAlert className="w-6 h-6 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                Each of six kinds of identifying information — location, time, device, serial number, owner name, and editing software — is marked Found or None. Camera settings and every other field are listed below.
              </p>
            </div>

            <div className="bg-muted rounded-field p-6 border-l-4 border-primary hover:bg-muted">
              <h3 className="mb-4 flex items-center gap-3 text-xl font-bold text-foreground">
                <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</span>
                Remove It and Recheck
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed pl-12 flex items-start">
                <Shield className="w-6 h-6 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                If anything was found, convert the photo in the Image Converter, then open the converted file in the viewer to confirm nothing is left.
              </p>
            </div>
          </div>
        </div>

        {/* Security and Privacy Section */}
        <div className="bg-card rounded-card p-8 shadow-soft">
          <h2 className="mb-6 flex items-center gap-3 text-h2 text-foreground">
            <span className="w-2 h-8 bg-primary rounded"></span>
            Safe and Fast Conversion
          </h2>
          
          <div className="space-y-6">
            <div className="bg-muted rounded-field p-6 border-l-4 border-primary hover:bg-muted">
              <h3 className="mb-4 flex items-center gap-3 text-xl font-bold text-foreground">
                <Shield className="w-6 h-6 text-muted-foreground mr-3" />
                Privacy Protection
              </h3>
              <ul className="text-base text-muted-foreground space-y-2 pl-9">
                <li>• Files are never uploaded to our servers</li>
                <li>• All conversion happens directly in your browser</li>
                <li>• Converted images are newly encoded without copying source EXIF data</li>
                <li>• Website analytics and advertising data are explained in the Privacy Policy</li>
                <li>• No registration required</li>
              </ul>
            </div>

            <div className="bg-muted rounded-field p-6 border-l-4 border-primary hover:bg-muted">
              <h3 className="mb-4 flex items-center gap-3 text-xl font-bold text-foreground">
                <Zap className="w-6 h-6 text-muted-foreground mr-3" />
                Fast Conversion
              </h3>
              <ul className="text-base text-muted-foreground space-y-2 pl-9">
                <li>• Fast processing regardless of internet speed</li>
                <li>• Real-time conversion progress tracking</li>
                <li>• No limits on number of conversions</li>
                <li>• No software installation or account required</li>
              </ul>
            </div>
          </div>
        </div>
        </div>
      </div>
    </main>
  );
}
