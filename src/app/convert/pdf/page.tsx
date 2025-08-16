import { Metadata } from 'next';
import PDFConverter from '@/components/PDFConverter';

export const metadata: Metadata = {
  title: 'PDF to Image Converter - Convert PDF to JPG, PNG Online Free | BravoConvert',
  description: 'Convert PDF pages to high-quality JPG or PNG images online. Free PDF to image converter with batch processing, auto-rotation, and privacy protection.',
  keywords: 'PDF to image, PDF to JPG, PDF to PNG, convert PDF, PDF converter, free PDF converter, online PDF to image',
  openGraph: {
    title: 'PDF to Image Converter - Convert PDF to JPG, PNG Online Free',
    description: 'Convert PDF pages to high-quality JPG or PNG images online. Batch processing available.',
    url: '/convert/pdf',
  },
};

export default function PDFConvertPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="container mx-auto px-4">
        <PDFConverter />
      </div>
    </div>
  );
}