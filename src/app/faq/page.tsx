import type { Metadata } from "next";
import { HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Image Editor and Converter FAQ | BravoConvert",
  description: "Answers about image editing, supported formats, local file processing, privacy, image conversion, and PDF rendering.",
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
          question: "Can I control image quality or file size?",
          answer: "Yes. For JPG and WebP output, enable compression to choose a quality level and optionally enter a target size in KB. The result depends on the image and browser, so the target is an estimate rather than a guaranteed exact size."
        },
        {
          question: "How does metadata removal work?",
          answer: "Converted JPG, PNG, and WebP files are newly encoded by the browser rather than copied byte-for-byte. This output does not include the source EXIF block, such as GPS and camera information. Always verify sensitive files before sharing."
        },
        {
          question: "Do I need to install software?",
          answer: "No. BravoConvert runs in a current web browser and does not require an app, extension, account, or login."
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
      category: "Image Editor",
      questions: [
        {
          question: "What can I do with the image editor?",
          answer: "You can resize one JPG, PNG, or WebP image, rotate it in 90-degree steps, flip it horizontally or vertically, preview the changes, and export the result as JPG, PNG, or WebP. The editor also provides undo, redo, and reset controls."
        },
        {
          question: "Does resizing preserve the image proportions?",
          answer: "Aspect ratio locking is enabled by default. When it is locked, changing the width automatically calculates the height and changing the height calculates the width. You can unlock it when you intentionally need independent dimensions."
        },
        {
          question: "What happens to transparency when I export as JPG?",
          answer: "JPG cannot store transparent pixels. The image editor fills transparent areas with the background color selected in the export settings. Choose PNG or WebP when transparency must be retained."
        },
        {
          question: "What is the difference between the image editor and image converter?",
          answer: "The image editor changes the size and orientation of one image. The image converter is designed for format conversion, compression controls, multiple-image batches, ZIP downloads, and combining images into a PDF."
        },
        {
          question: "Is my original image changed?",
          answer: "No. Editing is non-destructive and the original file on your device is not overwritten. BravoConvert creates a new file only when you choose Export image. Keep the original until you have reviewed the result."
        },
        {
          question: "Why is there a maximum image resolution?",
          answer: "Decoded images can use much more memory than their compressed file size suggests. The editor limits very large dimensions and pixel counts to reduce crashes or frozen tabs, especially on mobile devices."
        }
      ]
    },
    {
      category: "Conversion Features",
      questions: [
        {
          question: "Can I paste images from the clipboard?",
          answer: "Yes. The image converter accepts supported JPG, PNG, and WebP images pasted from the clipboard in compatible browsers."
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
          question: "Can I change the order of images before creating a PDF?",
          answer: "Yes. When PDF is selected as the output, use the reorder controls to arrange images before combining them into one PDF."
        },
        {
          question: "How are multiple converted files downloaded?",
          answer: "You can download converted images individually or download multiple results together as a ZIP archive."
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
