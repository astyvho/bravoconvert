"use client";
import Link from "next/link";
import { Shield, User, Check, Settings, AlertTriangle, RotateCcw, FileText, Mail, Calendar } from "lucide-react";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-4 flex items-center justify-center">
            <Shield className="w-16 h-16 text-gray-700 mr-4" />
            Terms of Service
          </h1>
          <p className="text-xl text-black mb-8">
            Clear and transparent terms for using BravoConvert
          </p>
          <p className="text-base text-gray-600">
            Last updated: January 1, 2025
          </p>
        </div>

        {/* Terms of Service Content */}
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-black to-gray-800 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-md">1</span>
                Service Description
              </h2>
              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black">
                <p className="text-base text-gray-700 mb-4 flex items-start">
                  <Settings className="w-6 h-6 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-black">BravoConvert Services:</strong> We provide free online file conversion tools with a focus on privacy and security.</span>
                </p>
                <ul className="text-base text-gray-700 space-y-2">
                  <li>• <strong>Image Converter:</strong> Convert between PNG, JPG, JPEG, and WebP formats</li>
                  <li>• <strong>PDF Creation:</strong> Combine multiple images into a single PDF document</li>
                  <li>• <strong>PDF to Image:</strong> Extract pages from PDF files as JPG or PNG images</li>
                  <li>• <strong>Free Access:</strong> All services are available without registration or payment</li>
                  <li>• <strong>Client-Side Processing:</strong> All conversions happen in your browser for maximum privacy</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-black to-gray-800 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-md">2</span>
                User Rights and Responsibilities
              </h2>
              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black">
                <p className="text-base text-gray-700 mb-4 flex items-start">
                  <User className="w-6 h-6 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-black">Your Rights:</strong> You have complete control over your files and data.</span>
                </p>
                <ul className="text-base text-gray-700 space-y-2">
                  <li>• <strong>File Ownership:</strong> You retain full ownership and copyright of all uploaded files</li>
                  <li>• <strong>Privacy Control:</strong> Your files never leave your device during processing</li>
                  <li>• <strong>No Data Collection:</strong> We do not collect, store, or access your personal information</li>
                  <li>• <strong>Immediate Use:</strong> Start using our services without any registration requirements</li>
                  <li>• <strong>Unlimited Access:</strong> No daily or monthly limits on file conversions</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-black to-gray-800 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-md">3</span>
                Acceptable Use Policy
              </h2>
              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black">
                <p className="text-base text-gray-700 mb-4 flex items-start">
                  <Check className="w-6 h-6 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-black">Responsible Usage:</strong> Please use our services responsibly and legally.</span>
                </p>
                <ul className="text-base text-gray-700 space-y-2">
                  <li>• <strong>Legal Content:</strong> Only upload files that you own or have permission to convert</li>
                  <li>• <strong>No Malicious Files:</strong> Do not upload files containing viruses, malware, or harmful code</li>
                  <li>• <strong>Respectful Use:</strong> Do not attempt to overload or disrupt our services</li>
                  <li>• <strong>Copyright Compliance:</strong> Ensure you have rights to convert and use the uploaded files</li>
                  <li>• <strong>File Size Limits:</strong> Respect the 10MB per image and 50MB per PDF limits</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-black to-gray-800 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-md">4</span>
                Technical Limitations
              </h2>
              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black">
                <p className="text-base text-gray-700 mb-4 flex items-start">
                  <Settings className="w-6 h-6 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-black">Service Constraints:</strong> Our services have certain technical limitations for optimal performance.</span>
                </p>
                <ul className="text-base text-gray-700 space-y-2">
                  <li>• <strong>File Formats:</strong> Supported formats are limited to PNG, JPG, JPEG, WebP for images and standard PDFs</li>
                  <li>• <strong>File Sizes:</strong> Maximum 10MB per image file, 50MB per PDF file</li>
                  <li>• <strong>Browser Requirements:</strong> Modern browsers with JavaScript enabled are required</li>
                  <li>• <strong>PDF Restrictions:</strong> Password-protected or encrypted PDFs are not supported</li>
                  <li>• <strong>Processing Time:</strong> Large files may take longer to process depending on your device</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-black to-gray-800 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-md">5</span>
                Limitation of Liability
              </h2>
              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black">
                <p className="text-base text-gray-700 mb-4 flex items-start">
                  <AlertTriangle className="w-6 h-6 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-black">Service Disclaimer:</strong> BravoConvert is provided "as is" without warranties.</span>
                </p>
                <ul className="text-base text-gray-700 space-y-2">
                  <li>• <strong>No Guarantees:</strong> We do not guarantee 100% accuracy in file conversions</li>
                  <li>• <strong>User Responsibility:</strong> You are responsible for backing up your original files</li>
                  <li>• <strong>No Data Loss Claims:</strong> We are not liable for any data loss or file corruption</li>
                  <li>• <strong>Third-Party Services:</strong> Issues with advertising services are not our responsibility</li>
                  <li>• <strong>Maximum Liability:</strong> Our liability is limited to the amount you paid for the service (which is $0)</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-black to-gray-800 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-md">6</span>
                Service Modifications
              </h2>
              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black">
                <p className="text-base text-gray-700 mb-4 flex items-start">
                  <RotateCcw className="w-6 h-6 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-black">Service Changes:</strong> We may modify or discontinue services as needed.</span>
                </p>
                <ul className="text-base text-gray-700 space-y-2">
                  <li>• <strong>Feature Updates:</strong> We may add, modify, or remove features without notice</li>
                  <li>• <strong>Service Availability:</strong> Services may be temporarily unavailable for maintenance</li>
                  <li>• <strong>Format Support:</strong> Supported file formats may change over time</li>
                  <li>• <strong>No Compensation:</strong> No compensation is provided for service changes or discontinuation</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-black to-gray-800 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-md">7</span>
                Terms Updates
              </h2>
              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black">
                <p className="text-base text-gray-700 mb-4 flex items-start">
                  <FileText className="w-6 h-6 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-black">Policy Changes:</strong> These terms may be updated to reflect service changes or legal requirements.</span>
                </p>
                <ul className="text-base text-gray-700 space-y-2">
                  <li>• <strong>Notification:</strong> Updated terms will be posted on this page</li>
                  <li>• <strong>Effective Date:</strong> Changes become effective immediately upon posting</li>
                  <li>• <strong>Continued Use:</strong> Continued use of services constitutes acceptance of new terms</li>
                  <li>• <strong>Opt-Out Option:</strong> You may stop using our services if you disagree with changes</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-black to-gray-800 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-md">8</span>
                Contact Information
              </h2>
              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black">
                <p className="text-base text-gray-700 mb-4 flex items-start">
                  <Mail className="w-6 h-6 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-black">Questions and Support:</strong> We're here to help with any questions about these terms.</span>
                </p>
                <ul className="text-base text-gray-700 space-y-2">
                  <li>• <strong>Email:</strong> convertstyvho@gmail.com</li>
                  <li>• <strong>Response Time:</strong> We typically respond to inquiries within 24 hours</li>
                  <li>• <strong>Legal Questions:</strong> For legal matters, please provide detailed information</li>
                </ul>
              </div>
            </div>
          </div>

          <hr className="my-12 border-gray-300" />
          <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200 shadow-md">
            <p className="text-base text-gray-700 flex items-center justify-center mb-2">
              <Calendar className="w-6 h-6 text-gray-700 mr-3" />
              <span><strong className="text-black">Effective Date:</strong> July 12, 2025</span>
            </p>
            <p className="text-sm text-gray-600">
              These terms apply to all BravoConvert services and may be updated as needed.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
} 