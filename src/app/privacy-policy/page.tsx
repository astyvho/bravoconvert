import Link from "next/link";
import { Shield, Settings, Smartphone, Lock, Hand, Mail, Calendar } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-4 flex items-center justify-center">
            <Shield className="w-16 h-16 text-gray-700 mr-4" />
            Privacy Policy
          </h1>
          <p className="text-xl text-black mb-8">
            Your privacy and data protection are our priority
          </p>
          <p className="text-base text-gray-600">
            Last updated: December 15, 2024
          </p>
        </div>

        {/* Privacy Policy Content */}
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-black to-gray-800 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-md">1</span>
                Information We Collect
              </h2>
              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black">
                <p className="text-base text-gray-700 mb-4 flex items-start">
                  <Shield className="w-6 h-6 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-black">No Personal Data Collection:</strong> BravoConvert operates with a fundamental principle of privacy by design. We do not collect, store, or process any personal information from our users.</span>
                </p>
                <ul className="text-base text-gray-700 space-y-2">
                  <li>• <strong>No Registration Required:</strong> You can use all our services without creating an account or providing any personal information</li>
                  <li>• <strong>No File Storage:</strong> All file conversions (images and PDFs) are processed entirely in your browser</li>
                  <li>• <strong>No Upload to Servers:</strong> Your files never leave your device during the conversion process</li>
                  <li>• <strong>No Tracking:</strong> We do not track your browsing behavior or collect usage analytics</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-black to-gray-800 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-md">2</span>
                How Our Services Work
              </h2>
              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black">
                <p className="text-base text-gray-700 mb-4 flex items-start">
                  <Settings className="w-6 h-6 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-black">Client-Side Processing:</strong> All file conversions happen directly in your web browser using JavaScript technology.</span>
                </p>
                <ul className="text-base text-gray-700 space-y-2">
                  <li>• <strong>Image Converter:</strong> PNG, JPG, WebP conversions and PDF creation happen locally in your browser</li>
                  <li>• <strong>PDF to Image:</strong> PDF page extraction and image conversion occur entirely on your device</li>
                  <li>• <strong>Real-Time Processing:</strong> Files are processed instantly without any server involvement</li>
                  <li>• <strong>Automatic Cleanup:</strong> Converted files are automatically removed from browser memory after download</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-black to-gray-800 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-md">3</span>
                Third-Party Services
              </h2>
              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black">
                <p className="text-base text-gray-700 mb-4 flex items-start">
                  <Smartphone className="w-6 h-6 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-black">Service Integration:</strong> Our service operates independently without third-party dependencies.</span>
                </p>
                <ul className="text-base text-gray-700 space-y-2">
                  <li>• <strong>No External Dependencies:</strong> All file processing happens entirely in your browser</li>
                  <li>• <strong>No File Sharing:</strong> Third-party services never have access to your uploaded files</li>
                  <li>• <strong>Complete Privacy:</strong> Your files remain completely private during processing</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-black to-gray-800 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-md">4</span>
                Data Security
              </h2>
              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black">
                <p className="text-base text-gray-700 mb-4 flex items-start">
                  <Lock className="w-6 h-6 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-black">Maximum Security:</strong> Your data security is guaranteed through our client-side processing approach.</span>
                </p>
                <ul className="text-base text-gray-700 space-y-2">
                  <li>• <strong>No Server Storage:</strong> Files are never stored on our servers or any cloud storage</li>
                  <li>• <strong>End-to-End Privacy:</strong> Only you have access to your files during the entire process</li>
                  <li>• <strong>Automatic Deletion:</strong> Files are automatically removed from browser memory after processing</li>
                  <li>• <strong>No Data Retention:</strong> We have no ability to access, view, or store your files</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-black to-gray-800 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-md">5</span>
                Your Rights
              </h2>
              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black">
                <p className="text-base text-gray-700 mb-4 flex items-start">
                  <Hand className="w-6 h-6 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-black">Complete Control:</strong> You maintain complete control over your data and privacy.</span>
                </p>
                <ul className="text-base text-gray-700 space-y-2">
                  <li>• <strong>No Data Collection:</strong> Since we don't collect personal data, there's nothing to request, modify, or delete</li>
                  <li>• <strong>Immediate Use:</strong> Start using our services immediately without any privacy concerns</li>
                  <li>• <strong>Browser Control:</strong> You can control all aspects of your privacy through browser settings</li>
                  <li>• <strong>Transparency:</strong> Our privacy practices are completely transparent and verifiable</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-black to-gray-800 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-md">6</span>
                Contact Information
              </h2>
              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-black">
                <p className="text-base text-gray-700 mb-4 flex items-start">
                  <Mail className="w-6 h-6 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-black">Privacy Inquiries:</strong> If you have any questions about our privacy practices, we're here to help.</span>
                </p>
                <ul className="text-base text-gray-700 space-y-2">
                  <li>• <strong>Email:</strong> bravoconvert.help@gmail.com</li>
                  <li>• <strong>Response Time:</strong> We typically respond to privacy inquiries within 1-4 weeks</li>
                  <li>• <strong>No Personal Data:</strong> Even in communications, we don't collect or store personal information</li>
                </ul>
              </div>
            </div>
          </div>

          <hr className="my-12 border-gray-300" />
          <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200 shadow-md">
            <p className="text-base text-gray-700 flex items-center justify-center mb-2">
              <Calendar className="w-6 h-6 text-gray-700 mr-3" />
              <span><strong className="text-black">Effective Date:</strong> December 15, 2024</span>
            </p>
            <p className="text-sm text-gray-600">
              This privacy policy applies to all BravoConvert services and may be updated as needed.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
} 