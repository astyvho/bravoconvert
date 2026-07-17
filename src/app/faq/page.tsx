import type { Metadata } from "next";
import { HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Image and PDF Converter FAQ | BravoConvert",
  description: "Answers about supported formats, local file processing, privacy, image conversion, and PDF rendering.",
  alternates: { canonical: "/faq" },
};

export default function FAQ() {
  const faqs = [
    {
      category: "Image Converter",
      questions: [
        {
          question: "What image formats can I convert?",
          answer: "You can convert JPG/JPEG, PNG, and WebP images to JPG, PNG, or WebP. You can also combine supported images into a single PDF file. Browser capabilities can vary, so keep your original files."
        },
        {
          question: "How does the image conversion process work?",
          answer: "All conversion is processed directly in your browser using JavaScript. Your files are never uploaded to our servers, ensuring complete privacy and faster processing. Simply upload your images, select the desired output format, and click convert."
        },
        {
          question: "Can I convert multiple images at once?",
          answer: "Yes. You can upload multiple images of the same detected input format and convert the batch to one selected output format. Multiple converted files can be downloaded as a ZIP archive."
        },
        {
          question: "How do I combine images into a PDF?",
          answer: "Upload multiple images, arrange them in the desired order using drag and drop, and click 'Convert to PDF'. All images will be combined into a single PDF file with each image on a separate page."
        },
        {
          question: "What's the maximum file size for images?",
          answer: "Each image file can be up to 10MB. For PDF creation, the total size of all images should not exceed 50MB for optimal performance."
        },
        {
          question: "What is the auto-rotation feature?",
          answer: "Our auto-rotation feature automatically detects and corrects photo orientation using EXIF data. This is especially useful for iPhone photos that appear sideways. The feature reads the camera's orientation information and rotates images to display correctly, eliminating the need to manually rotate photos."
        },
        {
          question: "How does metadata removal work?",
          answer: "Converted JPG, PNG, and WebP files are newly encoded by the browser rather than copied byte-for-byte. This output does not include the source EXIF block, such as GPS and camera information. Always verify sensitive files before sharing."
        },
        {
          question: "Can I turn off auto-rotation?",
          answer: "Yes. Auto-rotation can be switched off. Metadata is not copied into converted image output because the browser creates a newly encoded file."
        }
      ]
    },
    {
      category: "PDF to Image",
      questions: [
        {
          question: "What PDF formats are supported?",
          answer: "We support standard PDF files (version 1.4 and above). However, password-protected or encrypted PDFs cannot be processed. The maximum file size is 50MB."
        },
        {
          question: "What image formats can I convert PDF pages to?",
          answer: "You can convert PDF pages to JPG (JPEG) or PNG format. JPG is recommended for web use due to smaller file sizes, while PNG is better for printing due to lossless compression."
        },
        {
          question: "How does PDF to image conversion work?",
          answer: "Upload your PDF file, select the desired output format (JPG or PNG), and click 'Start Conversion'. Each page will be converted to a separate image file. You can download individual pages or all pages as a ZIP file."
        },
        {
          question: "What's the quality of the converted images?",
          answer: "Pages are rendered at a 2× PDF.js scale. PNG uses lossless image compression and is often clearer for text and diagrams, while JPG at high quality usually creates smaller files for photo-heavy pages. Output pixel dimensions depend on the PDF page size."
        },
        {
          question: "How long does PDF conversion take?",
          answer: "Conversion time depends on page count, page complexity, browser, memory, and device performance. Processing occurs in your browser and no PDF contents are uploaded to BravoConvert."
        }
      ]
    },
    {
      category: "Smart Features",
      questions: [
        {
          question: "Why are my iPhone photos appearing sideways?",
          answer: "iPhone and other smartphones save orientation information in EXIF data rather than physically rotating the image. Some applications don't read this data correctly, causing photos to appear sideways. Our auto-rotation feature fixes this by reading the EXIF orientation data and physically rotating the image."
        },
        {
          question: "What EXIF data is removed for privacy?",
          answer: "We remove all EXIF metadata including GPS coordinates (location where photo was taken), camera make and model, date and time, camera settings (ISO, aperture, shutter speed), and other technical data. This ensures your privacy when sharing photos online."
        },
        {
          question: "Does metadata removal affect image quality?",
          answer: "Re-encoding can change file size and may slightly change image quality for lossy JPG or WebP output. The source EXIF block is not copied to the converted output."
        },
        {
          question: "Which smartphones benefit most from auto-rotation?",
          answer: "All modern smartphones including iPhone, Samsung Galaxy, Google Pixel, and others benefit from auto-rotation. This feature is particularly useful for photos taken in portrait mode or when the phone was rotated during capture."
        },
        {
          question: "Is the auto-rotation feature safe for professional use?",
          answer: "Yes, our auto-rotation feature is safe for professional use. It reads standardized EXIF orientation values (1-8) and applies the correct rotation mathematically. This ensures accuracy and preserves image quality while fixing orientation issues."
        }
      ]
    },
    {
      category: "General",
      questions: [
        {
          question: "Is my data safe and private?",
          answer: "File contents are processed in your browser and are not uploaded to BravoConvert. The website still uses Google Analytics and Google AdSense, which may process usage, device, cookie, and advertising information as described in our Privacy Policy."
        },
        {
          question: "Do I need to create an account?",
          answer: "No account is required! BravoConvert is completely free to use and doesn't require any registration or login. Simply upload your files and start converting immediately."
        },
        {
          question: "What browsers are supported?",
          answer: "BravoConvert targets current Chrome, Edge, Firefox, and Safari releases. Image worker, PDF rendering, download, and encoding support can vary by browser and device; use an up-to-date browser and keep original files."
        },
        {
          question: "Are there any usage limits?",
          answer: "There are no daily or monthly limits on conversions. You can convert as many files as you need, whenever you need them. The only limits are the file size restrictions mentioned above."
        },
        {
          question: "What if I encounter an error?",
          answer: "If you encounter any issues, try refreshing the page or using a different browser. For persistent problems, check that your files meet the size and format requirements. You can also contact us for support."
        }
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-4 flex items-center justify-center">
            <HelpCircle className="w-16 h-16 text-gray-700 mr-4" />
            FAQ
          </h1>
          <p className="text-xl text-black mb-8">
            Frequently Asked Questions
          </p>
          <p className="text-base text-gray-600">
            Find answers to common questions about BravoConvert
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
              <h2 className="text-3xl font-bold text-black mb-8 flex items-center">
                <span className="w-2 h-8 bg-black rounded mr-3"></span>
                {category.category}
              </h2>
              <div className="space-y-6">
                {category.questions.map((faq, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6 border-l-4 border-black hover:bg-gray-100 transition-all duration-300">
                    <h3 className="text-xl font-bold text-black mb-4 flex items-center">
                      <span className="w-8 h-8 bg-gradient-to-br from-black to-gray-800 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-md">
                        {index + 1}
                      </span>
                      {faq.question}
                    </h3>
                    <p className="text-base text-gray-700 leading-relaxed pl-12">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
