'use client';

import { useState } from 'react';
import { Camera, FileText, BookOpen, FolderOpen, Settings, Lightbulb, Info, Check, X, Target, Lock, Globe, Zap } from 'lucide-react';

export default function HowToUsePage() {
  const [activeTab, setActiveTab] = useState('image');

  return (
    <section className="min-h-screen bg-white flex flex-col items-center px-4">
      <div className="w-full max-w-5xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-4">
            How to Use
          </h1>
          <p className="text-xl md:text-2xl text-black mb-8">
            Simple and Easy File Conversion Guide
          </p>
          <p className="text-lg text-black max-w-2xl mx-auto">
            Learn how to use our powerful conversion tools step by step. 
            Everything you need to know about converting images and PDFs.
          </p>
        </div>
        
        {/* 탭 네비게이션 */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 rounded-xl p-1 shadow-lg border border-gray-200">
            <button
              onClick={() => setActiveTab('image')}
              className={`px-8 py-4 rounded-lg text-base font-medium transition-all duration-300 ${
                activeTab === 'image'
                  ? 'bg-black text-white shadow-lg hover:bg-gray-800'
                  : 'text-gray-600 hover:text-black hover:bg-gray-50'
              }`}
            >
              Image Converter
            </button>
            <button
              onClick={() => setActiveTab('pdf')}
              className={`px-8 py-4 rounded-lg text-base font-medium transition-all duration-300 ${
                activeTab === 'pdf'
                  ? 'bg-black text-white shadow-lg hover:bg-gray-800'
                  : 'text-gray-600 hover:text-black hover:bg-gray-50'
              }`}
            >
              PDF to Image
            </button>
          </div>
        </div>

      {/* Image Converter 탭 */}
      {activeTab === 'image' && (
        <div className="space-y-8">
          {/* 소개 섹션 */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Image Converter</h2>
            <p className="text-xl text-black mb-8 max-w-3xl mx-auto">
              Convert PNG, JPG, WebP files to other formats and combine multiple images into a single PDF.
            </p>
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-8 shadow-lg border border-gray-200 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-black mb-6 flex items-center">
                <span className="w-2 h-8 bg-black rounded mr-3"></span>
                Who This Tool is Useful For
              </h3>
              <div className="text-gray-700 text-base leading-relaxed space-y-4">
                <div className="flex items-start space-x-3">
                  <Camera className="w-6 h-6 text-gray-700 mt-1 flex-shrink-0" />
                  <p><strong className="text-black">Content Creators</strong> can use it for SNS optimization, website conversion, and portfolio PDF creation.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <FileText className="w-6 h-6 text-gray-700 mt-1 flex-shrink-0" />
                  <p><strong className="text-black">Business Users</strong> will find it helpful for report integration, presentation materials, and document attachment conversion.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <BookOpen className="w-6 h-6 text-gray-700 mt-1 flex-shrink-0" />
                  <p><strong className="text-black">Students/Researchers</strong> can use it for thesis optimization, presentation PDFs, and research material organization.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <FolderOpen className="w-6 h-6 text-gray-700 mt-1 flex-shrink-0" />
                  <p><strong className="text-black">General Users</strong> can also utilize it for personal photo organization, family album PDFs, and online sharing conversion.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 기본 이미지 변환 */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
            <h3 className="text-2xl font-bold text-black mb-6 flex items-center">
              <span className="w-10 h-10 bg-gradient-to-br from-black to-gray-800 text-white rounded-full flex items-center justify-center text-lg font-bold mr-4 shadow-md">1</span>
              Basic Image Conversion
            </h3>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black">
                <h4 className="font-bold text-black mb-3 text-lg flex items-center">
                  <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                  File Upload
                </h4>
                <ul className="text-base text-gray-700 space-y-2">
                  <li>• <strong>Drag & Drop:</strong> Drag image files directly into the browser window</li>
                  <li>• <strong>Click Upload:</strong> Click the "Select Files" button to choose images</li>
                  <li>• <strong>Supported Formats:</strong> PNG, JPG, JPEG, WebP files</li>
                  <li>• <strong>Multiple Selection:</strong> Use Ctrl(Cmd) + click to select multiple files at once</li>
                  <li>• <strong>File Size:</strong> No strict limit, but depends on your browser and PC performance. We recommend files under 50MB for stable processing.</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black">
                <h4 className="font-bold text-black mb-3 text-lg flex items-center">
                  <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                  Output Format Selection
                </h4>
                <ul className="text-base text-gray-700 space-y-2">
                  <li>• <strong>WebP:</strong> Web optimized, small file size (recommended)</li>
                  <li>• <strong>JPG:</strong> Universal, adjustable compression</li>
                  <li>• <strong>PNG:</strong> Transparency support, lossless compression</li>
                  <li>• <strong>Individual Settings:</strong> You can select different formats for each image</li>
                  <li>• <strong>Quality Control:</strong> Quality can be adjusted for some formats</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black">
                <h4 className="font-bold text-black mb-3 text-lg flex items-center">
                  <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
                  Start Conversion
                </h4>
                <ul className="text-base text-gray-700 space-y-2">
                  <li>• <strong>"Convert All" Button:</strong> Converts all selected images at once</li>
                  <li>• <strong>Progress Display:</strong> Real-time conversion progress can be monitored</li>
                  <li>• <strong>Conversion Time:</strong> Varies by file size and count, usually completes within seconds</li>
                  <li>• <strong>Browser Processing:</strong> All conversions are processed directly in the browser for safety</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black">
                <h4 className="font-bold text-black mb-3 text-lg flex items-center">
                  <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">4</span>
                  Download Results
                </h4>
                <ul className="text-base text-gray-700 space-y-2">
                  <li>• <strong>Individual Download:</strong> Click the download button next to each image</li>
                  <li>• <strong>"Save All" Button:</strong> Downloads all converted images at once</li>
                  <li>• <strong>ZIP File:</strong> 2 or more images are automatically compressed into a ZIP file</li>
                  <li>• <strong>File Names:</strong> Format information is added to the original filename</li>
                  <li>• <strong>Download Location:</strong> Saved to the browser's default download folder</li>
                </ul>
              </div>
            </div>
          </div>

          {/* PDF 변환 */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
            <h3 className="text-2xl font-bold text-black mb-6 flex items-center">
              <span className="w-10 h-10 bg-gradient-to-br from-black to-gray-800 text-white rounded-full flex items-center justify-center text-lg font-bold mr-4 shadow-md">2</span>
              Convert Images to PDF
            </h3>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black">
                <h4 className="font-bold text-black mb-3 text-lg flex items-center">
                  <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                  Image Upload
                </h4>
                <ul className="text-base text-gray-700 space-y-2">
                  <li>• <strong>Multiple Images:</strong> Upload all images you want to combine into a PDF</li>
                  <li>• <strong>Order Consideration:</strong> Upload order becomes the PDF page order</li>
                  <li>• <strong>Supported Formats:</strong> PNG, JPG, WebP, GIF, and all image formats</li>
                  <li>• <strong>File Size:</strong> No strict total limit, but large numbers of files or very large files may impact browser performance.</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black">
                <h4 className="font-bold text-black mb-3 text-lg flex items-center">
                  <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                  Order Adjustment (Optional)
                </h4>
                <ul className="text-base text-gray-700 space-y-2">
                  <li>• <strong>"Change Order" Button:</strong> Activate order change mode</li>
                  <li>• <strong>Drag & Drop:</strong> Drag images to desired positions</li>
                  <li>• <strong>Auto Sort:</strong> Automatic sorting by filename, then manual adjustment</li>
                  <li>• <strong>Order Check:</strong> Number display shows current order</li>
                  <li>• <strong>"Reset Order" Button:</strong> Return to original order</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black">
                <h4 className="font-bold text-black mb-3 text-lg flex items-center">
                  <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
                  View Mode Selection
                </h4>
                <ul className="text-base text-gray-700 space-y-2">
                  <li>• <strong>Card View:</strong> Large grid preview of images (recommended for 25 or fewer)</li>
                  <li>• <strong>List View:</strong> Compact list format (recommended for over 25)</li>
                  <li>• <strong>Responsive Grid:</strong> Column count adjusts automatically based on screen size</li>
                  <li>• <strong>Preview:</strong> Thumbnail preview of each image</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black">
                <h4 className="font-bold text-black mb-3 text-lg flex items-center">
                  <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">4</span>
                  PDF Generation
                </h4>
                <ul className="text-base text-gray-700 space-y-2">
                  <li>• <strong>"Convert to PDF" Button:</strong> Combines all images into one PDF</li>
                  <li>• <strong>A4 Size:</strong> All images are automatically adjusted to A4 paper size</li>
                  <li>• <strong>Page Orientation:</strong> Portrait/landscape automatically set based on image ratio</li>
                  <li>• <strong>Quality Preservation:</strong> Original image quality is maintained as much as possible</li>
                  <li>• <strong>Download:</strong> PDF file is automatically downloaded after conversion</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 고급 기능 */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
            <h3 className="text-2xl font-bold text-black mb-6 flex items-center">
              <Settings className="w-6 h-6 text-gray-700 mr-3" />
              Advanced Features & Tips
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                <h4 className="font-bold text-black mb-4 text-lg flex items-center">
                  <Lightbulb className="w-5 h-5 text-gray-700 mr-2" />
                  Usage Tips
                </h4>
                <ul className="space-y-3 text-base text-gray-700">
                  <li>• <strong>File Naming:</strong> Organize filenames before conversion for easier order adjustment</li>
                  <li>• <strong>Format Selection:</strong> Use WebP for web, PNG for printing</li>
                  <li>• <strong>Batch Processing:</strong> Process similar images together for efficiency</li>
                  <li>• <strong>Backup:</strong> Backup original images before conversion</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                <h4 className="font-bold text-black mb-4 text-lg flex items-center">
                  <Settings className="w-5 h-5 text-gray-700 mr-2" />
                  Advanced Features
                </h4>
                <ul className="space-y-3 text-base text-gray-700">
                  <li>• <strong>Drag & Drop:</strong> Intuitive order changing</li>
                  <li>• <strong>Real-time Progress:</strong> Monitor conversion process in real-time</li>
                  <li>• <strong>Responsive Design:</strong> Supports mobile, tablet, and PC devices</li>
                  <li>• <strong>Privacy Protection:</strong> All processing is done in the browser</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF to Image 탭 */}
      {activeTab === 'pdf' && (
        <div className="space-y-8">
          {/* 소개 섹션 */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">PDF to Image</h2>
            <p className="text-xl text-black mb-8 max-w-3xl mx-auto">
              Convert each page of a PDF file into high-quality images.
            </p>
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-8 shadow-lg border border-gray-200 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-black mb-6 flex items-center">
                <span className="w-2 h-8 bg-black rounded mr-3"></span>
                Who This Tool is Useful For
              </h3>
              <div className="text-gray-700 text-base leading-relaxed space-y-4">
                <div className="flex items-start space-x-3">
                  <BookOpen className="w-6 h-6 text-gray-700 mt-1 flex-shrink-0" />
                  <p><strong className="text-black">Educators/Instructors</strong> can use it for textbook extraction, presentation slides, and online course material preparation.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <FileText className="w-6 h-6 text-gray-700 mt-1 flex-shrink-0" />
                  <p><strong className="text-black">Business Users</strong> will find it helpful for contract imaging, report extraction, and document archive conversion.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Camera className="w-6 h-6 text-gray-700 mt-1 flex-shrink-0" />
                  <p><strong className="text-black">Designers/Creators</strong> can use it for PDF portfolio imaging, design reference materials, and social media image creation.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <FolderOpen className="w-6 h-6 text-gray-700 mt-1 flex-shrink-0" />
                  <p><strong className="text-black">General Users</strong> can also utilize it for scanned document extraction, family document imaging, and personal material organization.</p>
                </div>
              </div>
            </div>
          </div>

          {/* PDF 변환 과정 */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
            <h3 className="text-2xl font-bold text-black mb-6 flex items-center">
              <span className="w-10 h-10 bg-gradient-to-br from-black to-gray-800 text-white rounded-full flex items-center justify-center text-lg font-bold mr-4 shadow-md">1</span>
              Convert PDF to Images
            </h3>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black">
                <h4 className="font-bold text-black mb-3 text-lg flex items-center">
                  <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                  PDF File Upload
                </h4>
                <ul className="text-base text-gray-700 space-y-2">
                  <li>• <strong>File Selection:</strong> Click the "Select PDF File" button to choose the PDF to convert</li>
                  <li>• <strong>Drag & Drop:</strong> You can also drag PDF files directly into the browser window</li>
                  <li>• <strong>File Size:</strong> No strict limit. Performance depends on your browser and PC's memory.</li>
                  <li>• <strong>Page Count:</strong> Conversion time varies by number of pages</li>
                  <li>• <strong>File Format:</strong> Only standard PDF files supported (encrypted PDFs not supported)</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black">
                <h4 className="font-bold text-black mb-3 text-lg flex items-center">
                  <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                  Output Format Selection
                </h4>
                <ul className="text-base text-gray-700 space-y-2">
                  <li>• <strong>JPG (JPEG):</strong> High compression, smaller file size</li>
                  <li>• <strong>PNG:</strong> Lossless compression, excellent quality</li>
                  <li>• <strong>Quality Consideration:</strong> Use PNG for printing, JPG for web</li>
                  <li>• <strong>File Size:</strong> PNG has larger file sizes</li>
                  <li>• <strong>Transparency:</strong> PNG supports transparency but not applicable when extracting from PDF</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black">
                <h4 className="font-bold text-black mb-3 text-lg flex items-center">
                  <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
                  Start Conversion
                </h4>
                <ul className="text-base text-gray-700 space-y-2">
                  <li>• <strong>"Start Conversion" Button:</strong> Begins converting PDF to images</li>
                  <li>• <strong>Progress Display:</strong> Real-time conversion progress for each page</li>
                  <li>• <strong>Conversion Time:</strong> Varies by page count and file size, usually 1-3 seconds per page</li>
                  <li>• <strong>Browser Processing:</strong> All conversions are processed directly in the browser for safety</li>
                  <li>• <strong>Memory Usage:</strong> Ensure sufficient browser memory for large PDF files</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black">
                <h4 className="font-bold text-black mb-3 text-lg flex items-center">
                  <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">4</span>
                  Download Results
                </h4>
                <ul className="text-base text-gray-700 space-y-2">
                  <li>• <strong>Individual Download:</strong> Click the download button next to each page image</li>
                  <li>• <strong>Batch Download:</strong> Use "Download All Images" button to download as ZIP file</li>
                  <li>• <strong>File Names:</strong> Saved as "originalfilename_pagenumber.extension" format</li>
                  <li>• <strong>Image Quality:</strong> Maintains original PDF resolution as much as possible</li>
                  <li>• <strong>Download Location:</strong> Saved to browser's default download folder</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 지원 정보 */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
            <h3 className="text-2xl font-bold text-black mb-6 flex items-center">
              <Info className="w-6 h-6 text-gray-700 mr-3" />
              Support Information & Limitations
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                <h4 className="font-bold text-black mb-4 text-lg flex items-center">
                  <Check className="w-5 h-5 text-gray-700 mr-2" />
                  Supported Formats
                </h4>
                <ul className="space-y-3 text-base text-gray-700">
                  <li>• <strong>Input:</strong> Standard PDF files (version 1.4 and above)</li>
                  <li>• <strong>Output:</strong> JPG, PNG images</li>
                  <li>• <strong>Resolution:</strong> Up to 300 DPI supported</li>
                  <li>• <strong>Color:</strong> RGB, CMYK color modes supported</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                <h4 className="font-bold text-black mb-4 text-lg flex items-center">
                  <X className="w-5 h-5 text-gray-700 mr-2" />
                  Limitations
                </h4>
                <ul className="space-y-3 text-base text-gray-700">
                  <li>• <strong>Encrypted PDFs:</strong> Password-protected PDFs cannot be converted</li>
                  <li>• <strong>File Size:</strong> No strict limit. Performance depends on your browser and PC's memory.</li>
                  <li>• <strong>Page Count:</strong> Processed within browser memory limits</li>
                  <li>• <strong>Complex Graphics:</strong> Very complex vector graphics may have reduced quality</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 사용 팁 */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
            <h3 className="text-2xl font-bold text-black mb-6 flex items-center">
              <Lightbulb className="w-6 h-6 text-gray-700 mr-3" />
              Usage Tips
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                <h4 className="font-bold text-black mb-4 text-lg flex items-center">
                  <Target className="w-5 h-5 text-gray-700 mr-2" />
                  Tips for Best Results
                </h4>
                <ul className="space-y-3 text-base text-gray-700">
                  <li>• <strong>High Quality PDF:</strong> Better original PDF quality results in better image quality</li>
                  <li>• <strong>Format Selection:</strong> Use PNG for text-heavy documents, JPG for photo-heavy documents</li>
                  <li>• <strong>Page Count:</strong> Process large PDFs in parts for stability</li>
                  <li>• <strong>Browser Optimization:</strong> Close other tabs and ensure sufficient memory</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                <h4 className="font-bold text-black mb-4 text-lg flex items-center">
                  <Settings className="w-5 h-5 text-gray-700 mr-2" />
                  Usage Methods
                </h4>
                <ul className="space-y-3 text-base text-gray-700">
                  <li>• <strong>Document Archive:</strong> Store important documents as images</li>
                  <li>• <strong>Presentations:</strong> Use PDF slides as individual images</li>
                  <li>• <strong>Social Media:</strong> Convert PDF content to SNS images</li>
                  <li>• <strong>Document Sharing:</strong> Share images instead of PDFs for better compatibility</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

        <hr className="my-12 border-gray-300" />
        
        {/* 클라이언트 사이드 처리 정보 */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-8 shadow-lg border border-gray-200 mb-8 hover:shadow-xl transition-all duration-300">
          <h3 className="text-2xl font-bold text-black mb-6 flex items-center">
            <Lock className="w-6 h-6 text-gray-700 mr-3" />
            Secure & Private Processing
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
              <h4 className="font-bold text-black mb-4 text-lg flex items-center">
                <Globe className="w-5 h-5 text-gray-700 mr-2" />
                Browser-Side Conversion
              </h4>
              <ul className="space-y-3 text-base text-gray-700">
                <li>• <strong>Complete Privacy:</strong> Your files are never uploaded to our servers.</li>
                <li>• <strong>No File Size Limit:</strong> Conversion is limited only by your device's performance.</li>
                <li>• <strong>Fast & Efficient:</strong> No network upload time means faster processing for you.</li>
                <li>• <strong>Works Offline:</strong> Once the page is loaded, you can convert files even without an internet connection.</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
              <h4 className="font-bold text-black mb-4 text-lg flex items-center">
                <Zap className="w-5 h-5 text-gray-700 mr-2" />
                Performance Tips
              </h4>
              <ul className="space-y-3 text-base text-gray-700">
                <li>• <strong>Memory:</strong> For very large files or batch conversions, ensure your computer has enough available RAM.</li>
                <li>• <strong>Browser:</strong> Using an up-to-date browser like Chrome or Firefox is recommended.</li>
                <li>• <strong>Batch Size:</strong> If you experience slowdowns, try converting a smaller number of files at a time.</li>
                <li>• <strong>Other Tabs:</strong> Closing other memory-intensive browser tabs can improve performance.</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-md">
            <p className="text-base text-gray-700 flex items-start">
              <Lightbulb className="w-5 h-5 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
              <span><strong className="text-black">Note:</strong> Since all processing is done on your computer (in the browser), you have full control over your data. There are no server-side restrictions on file size or usage.</span>
            </p>
          </div>
        </div>

        <div className="text-center bg-gradient-to-r from-gray-50 to-white rounded-xl p-8 shadow-lg border border-gray-200">
          <p className="text-lg text-gray-700 mb-4 flex items-center justify-center">
            <Lock className="w-5 h-5 text-gray-700 mr-3" />
            All conversions are processed directly in the browser. Files are not sent to servers, ensuring complete privacy protection.
          </p>
          <p className="text-base text-gray-600">
            Contact: <a href="mailto:convertstyvho@gmail.com" className="text-black hover:text-gray-800 hover:underline font-medium transition-colors duration-200">convertstyvho@gmail.com</a>
          </p>
        </div>
      </div>
    </section>
  );
} 