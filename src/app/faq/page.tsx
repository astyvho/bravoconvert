import { HelpCircle } from "lucide-react";

export default function FAQ() {
  const faqs = [
    {
      category: "Image Converter",
      questions: [
        {
          question: "What image formats can I convert?",
          answer: "You can convert between PNG, JPG, JPEG, and WebP formats. The tool supports converting any of these formats to any other format, and you can also combine multiple images into a single PDF file."
        },
        {
          question: "How does the image conversion process work?",
          answer: "All conversion is processed directly in your browser using JavaScript. Your files are never uploaded to our servers, ensuring complete privacy and faster processing. Simply upload your images, select the desired output format, and click convert."
        },
        {
          question: "Can I convert multiple images at once?",
          answer: "Yes! You can upload multiple images and convert them all at once. Each image can be converted to a different format if needed. For multiple images, you'll receive a ZIP file containing all converted images."
        },
        {
          question: "How do I combine images into a PDF?",
          answer: "Upload multiple images, arrange them in the desired order using drag and drop, and click 'Convert to PDF'. All images will be combined into a single PDF file with each image on a separate page."
        },
        {
          question: "What's the maximum file size for images?",
          answer: "Each image file can be up to 10MB. For PDF creation, the total size of all images should not exceed 50MB for optimal performance."
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
          answer: "The converted images maintain the original PDF resolution up to 300 DPI. PNG format preserves quality better for text-heavy documents, while JPG is more efficient for photo-heavy documents."
        },
        {
          question: "How long does PDF conversion take?",
          answer: "Conversion time depends on the number of pages and file size. Typically, each page takes 1-3 seconds to convert. The process happens entirely in your browser, so it's safe and private."
        }
      ]
    },
    {
      category: "General",
      questions: [
        {
          question: "Is my data safe and private?",
          answer: "Absolutely! All file processing happens directly in your browser. Your files are never uploaded to our servers, ensuring complete privacy and security. No one can access your files except you."
        },
        {
          question: "Do I need to create an account?",
          answer: "No account is required! BravoConvert is completely free to use and doesn't require any registration or login. Simply upload your files and start converting immediately."
        },
        {
          question: "What browsers are supported?",
          answer: "BravoConvert works on all modern browsers including Chrome, Firefox, Safari, and Edge. For the best experience, we recommend using the latest version of your browser."
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