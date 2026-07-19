import type { Metadata } from "next";
import { Upload, Image, FileText, Download, Zap, Shield, BookOpen, Archive, SlidersHorizontal, PencilRuler, RotateCw } from "lucide-react";

export const metadata: Metadata = {
  title: "How to Use BravoConvert",
  description: "Step-by-step instructions for editing images, converting JPG, PNG and WebP files, and rendering PDF pages as images.",
  alternates: { canonical: "/how-to-use" },
};

export default function HowToUsePage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-4 flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-gray-700 mr-4" />
            How to Use
          </h1>
          <p className="text-xl text-black mb-8">
            BravoConvert is really easy to use!
          </p>
          <p className="text-base text-gray-600">
            Convert or edit a file in just 3 steps
          </p>
        </div>

        {/* Image Converter Usage */}
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 mb-8">
          <h2 className="text-3xl font-bold text-black mb-8 flex items-center">
            <span className="w-2 h-8 bg-black rounded mr-3"></span>
            Image Converter
          </h2>
          
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black hover:bg-gray-100 transition-all duration-300">
              <h3 className="text-xl font-bold text-black mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-black to-gray-800 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-md">
                  1
                </span>
                Upload Files
              </h3>
              <p className="text-base text-gray-700 leading-relaxed pl-12 flex items-start">
                <Upload className="w-6 h-6 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                Drag and drop or click to upload JPG/JPEG, PNG, or WebP images. Each image must be 10MB or smaller.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black hover:bg-gray-100 transition-all duration-300">
              <h3 className="text-xl font-bold text-black mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-black to-gray-800 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-md">
                  2
                </span>
                Select Format
              </h3>
              <p className="text-base text-gray-700 leading-relaxed pl-12 flex items-start">
                <Zap className="w-6 h-6 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                Choose your desired output format (PNG, JPG, WebP, PDF). You can also combine multiple images into a single PDF.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black hover:bg-gray-100 transition-all duration-300">
              <h3 className="text-xl font-bold text-black mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-black to-gray-800 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-md">
                  3
                </span>
                Download
              </h3>
              <p className="text-base text-gray-700 leading-relaxed pl-12 flex items-start">
                <Download className="w-6 h-6 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                Click the convert button and download your completed files. Multiple files are provided as a ZIP archive.
              </p>
            </div>
          </div>

          {/* Conversion Features Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="text-lg font-bold text-black mb-4 flex items-center">
              <span className="mr-2">🎯</span>
              Useful Conversion Tools
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <SlidersHorizontal className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-black">Quality & File Size Controls</div>
                  <div className="text-sm text-gray-700">Adjust JPG and WebP quality or set an optional target size</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Archive className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-black">Batch Downloads</div>
                  <div className="text-sm text-gray-700">Convert multiple images and download the results together as ZIP</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-lg font-bold text-black mb-3">Tips</h4>
            <ul className="text-base text-gray-700 space-y-2">
              <li>• <strong className="text-black">Multiple Files:</strong> You can upload multiple images at once</li>
              <li>• <strong className="text-black">PDF Creation:</strong> Combine multiple images into a single PDF</li>
              <li>• <strong className="text-black">Compression:</strong> Adjust quality or choose a target size for JPG and WebP</li>
              <li>• <strong className="text-black">File Size:</strong> Each image supports up to 10MB</li>
            </ul>
          </div>
        </div>

        {/* PDF to Image Converter Usage */}
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 mb-8">
          <h2 className="text-3xl font-bold text-black mb-8 flex items-center">
            <span className="w-2 h-8 bg-black rounded mr-3"></span>
            PDF to Image Converter
          </h2>
          
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black hover:bg-gray-100 transition-all duration-300">
              <h3 className="text-xl font-bold text-black mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-black to-gray-800 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-md">
                  1
                </span>
                Upload PDF
              </h3>
              <p className="text-base text-gray-700 leading-relaxed pl-12 flex items-start">
                <FileText className="w-6 h-6 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                Upload the PDF file you want to convert to images. Supports up to 50MB file size.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black hover:bg-gray-100 transition-all duration-300">
              <h3 className="text-xl font-bold text-black mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-black to-gray-800 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-md">
                  2
                </span>
                Select Format
              </h3>
              <p className="text-base text-gray-700 leading-relaxed pl-12 flex items-start">
                <Image className="w-6 h-6 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                Choose between JPG or PNG for your desired image format. JPG has smaller file sizes, while PNG offers better quality.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black hover:bg-gray-100 transition-all duration-300">
              <h3 className="text-xl font-bold text-black mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-black to-gray-800 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-md">
                  3
                </span>
                Convert & Download
              </h3>
              <p className="text-base text-gray-700 leading-relaxed pl-12 flex items-start">
                <Download className="w-6 h-6 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                Each page is converted to individual images and downloaded. Multiple pages are provided as a ZIP file.
              </p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-lg font-bold text-black mb-3">Tips</h4>
            <ul className="text-base text-gray-700 space-y-2">
              <li>• <strong className="text-black">Page-by-Page:</strong> Each PDF page becomes a separate image file</li>
              <li>• <strong className="text-black">ZIP Archive:</strong> Multiple pages are bundled together for download</li>
              <li>• <strong className="text-black">Local Processing:</strong> PDF pages are rendered on your device</li>
              <li>• <strong className="text-black">File Size:</strong> PDFs support up to 50MB</li>
            </ul>
          </div>
        </div>

        {/* Image Editor Usage */}
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 mb-8">
          <h2 className="text-3xl font-bold text-black mb-3 flex items-center">
            <span className="w-2 h-8 bg-black rounded mr-3"></span>
            Image Editor
          </h2>
          <p className="mb-8 text-gray-600 leading-7">Use the image editor when you need to change one image&apos;s dimensions or orientation. Use the image converter instead when you need batch conversion, ZIP downloads, compression targets, or an image-based PDF.</p>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black hover:bg-gray-100 transition-all duration-300">
              <h3 className="text-xl font-bold text-black mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-black to-gray-800 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-md">1</span>
                Add One Image
              </h3>
              <p className="text-base text-gray-700 leading-relaxed pl-12 flex items-start">
                <Upload className="w-6 h-6 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                Drop, select, or paste a JPG, PNG, or WebP image. The file must be 10MB or smaller and is processed on your device.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black hover:bg-gray-100 transition-all duration-300">
              <h3 className="text-xl font-bold text-black mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-black to-gray-800 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-md">2</span>
                Resize, Rotate, or Flip
              </h3>
              <p className="text-base text-gray-700 leading-relaxed pl-12 flex items-start">
                <RotateCw className="w-6 h-6 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                Enter exact pixel dimensions or use a percentage preset. Keep the aspect ratio locked to prevent stretching, then rotate or flip the preview as needed.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black hover:bg-gray-100 transition-all duration-300">
              <h3 className="text-xl font-bold text-black mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-black to-gray-800 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-md">3</span>
                Export the Edited Image
              </h3>
              <p className="text-base text-gray-700 leading-relaxed pl-12 flex items-start">
                <Download className="w-6 h-6 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                Choose JPG, PNG, or WebP, set quality where available, enter a file name, and download the edited result. Choose a background color when exporting transparency to JPG.
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-6">
            <div className="flex items-start gap-3">
              <PencilRuler className="w-5 h-5 text-gray-700 mt-1 flex-shrink-0" />
              <div><div className="font-semibold text-black">Non-destructive preview</div><div className="text-sm text-gray-700">Undo, redo, or reset without changing the original file</div></div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-gray-700 mt-1 flex-shrink-0" />
              <div><div className="font-semibold text-black">Local processing</div><div className="text-sm text-gray-700">The source image is not uploaded to BravoConvert</div></div>
            </div>
          </div>
        </div>

        {/* Security and Privacy Section */}
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
          <h2 className="text-3xl font-bold text-black mb-8 flex items-center">
            <span className="w-2 h-8 bg-black rounded mr-3"></span>
            Safe and Fast Conversion
          </h2>
          
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black hover:bg-gray-100 transition-all duration-300">
              <h3 className="text-xl font-bold text-black mb-4 flex items-center">
                <Shield className="w-6 h-6 text-gray-700 mr-3" />
                Privacy Protection
              </h3>
              <ul className="text-base text-gray-700 space-y-2 pl-9">
                <li>• Files are never uploaded to our servers</li>
                <li>• All conversion happens directly in your browser</li>
                <li>• Converted images are newly encoded without copying source EXIF data</li>
                <li>• Website analytics and advertising data are explained in the Privacy Policy</li>
                <li>• No registration required</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black hover:bg-gray-100 transition-all duration-300">
              <h3 className="text-xl font-bold text-black mb-4 flex items-center">
                <Zap className="w-6 h-6 text-gray-700 mr-3" />
                Fast Conversion
              </h3>
              <ul className="text-base text-gray-700 space-y-2 pl-9">
                <li>• Fast processing regardless of internet speed</li>
                <li>• Real-time conversion progress tracking</li>
                <li>• No limits on number of conversions</li>
                <li>• No software installation or account required</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
