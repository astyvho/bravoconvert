import type { Metadata } from "next";
import ContentHeader from "@/components/content/content-header";
import { Shield, User, Check, Settings, AlertTriangle, RotateCcw, FileText, Mail, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | BravoConvert",
  description: "Terms governing use of BravoConvert's browser-based image editing, image conversion, and PDF tools.",
  alternates: { canonical: "/terms/" },
};

export default function TermsPage() {
  return (
    <main>
      <div className="mx-auto w-full max-w-[1120px] px-4 pb-16 pt-6 sm:px-6">
        <ContentHeader label="Legal" title="Terms of Service">
          <p className="mt-3 text-lg leading-relaxed text-foreground">
            Clear and transparent terms for using BravoConvert
          </p>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            Last updated: July 17, 2026
          </p>
        </ContentHeader>

        <div className="mt-10 max-w-[880px] space-y-8">

        {/* Terms of Service Content */}
        <div className="bg-card rounded-card p-8 shadow-soft">
          <div className="space-y-8">
            <div>
              <h2 className="mb-6 flex items-center gap-3 text-h2 text-foreground">
                <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</span>
                Service Description
              </h2>
              <div className="bg-muted rounded-field p-6 border-l-4 border-primary">
                <p className="text-base text-muted-foreground mb-4 flex items-start">
                  <Settings className="w-6 h-6 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">BravoConvert Services:</strong> We provide free online image editing and file conversion tools with a focus on privacy and security.</span>
                </p>
                <ul className="text-base text-muted-foreground space-y-2">
                  <li>• <strong>Image Converter:</strong> Convert between PNG, JPG, JPEG, and WebP formats</li>
                  <li>• <strong>Image Editor:</strong> Resize, rotate, flip, and export supported images</li>
                  <li>• <strong>PDF Creation:</strong> Combine multiple images into a single PDF document</li>
                  <li>• <strong>PDF to Image:</strong> Render PDF pages as JPG or PNG images</li>
                  <li>• <strong>Free Access:</strong> All services are available without registration or payment</li>
                  <li>• <strong>Client-Side Processing:</strong> Supported editing and conversion tasks run in your browser without sending file contents to BravoConvert</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="mb-6 flex items-center gap-3 text-h2 text-foreground">
                <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</span>
                User Rights and Responsibilities
              </h2>
              <div className="bg-muted rounded-field p-6 border-l-4 border-primary">
                <p className="text-base text-muted-foreground mb-4 flex items-start">
                  <User className="w-6 h-6 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Your Files:</strong> You choose the files processed by the browser and remain responsible for keeping backups.</span>
                </p>
                <ul className="text-base text-muted-foreground space-y-2">
                  <li>• <strong>File Ownership:</strong> You retain any rights you already hold in the files you select</li>
                  <li>• <strong>Local File Processing:</strong> Selected file contents are not sent to a BravoConvert processing server</li>
                  <li>• <strong>Website Data:</strong> Analytics and advertising services may process usage and device information as described in our Privacy Policy</li>
                  <li>• <strong>Immediate Use:</strong> Start using our services without any registration requirements</li>
                  <li>• <strong>Current Access:</strong> No account-based daily or monthly quota is currently imposed; technical limits still apply</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="mb-6 flex items-center gap-3 text-h2 text-foreground">
                <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</span>
                Acceptable Use Policy
              </h2>
              <div className="bg-muted rounded-field p-6 border-l-4 border-primary">
                <p className="text-base text-muted-foreground mb-4 flex items-start">
                  <Check className="w-6 h-6 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Responsible Usage:</strong> Please use our services responsibly and legally.</span>
                </p>
                <ul className="text-base text-muted-foreground space-y-2">
                  <li>• <strong>Legal Content:</strong> Only upload files that you own or have permission to convert</li>
                  <li>• <strong>No Malicious Files:</strong> Do not upload files containing viruses, malware, or harmful code</li>
                  <li>• <strong>Respectful Use:</strong> Do not attempt to overload or disrupt our services</li>
                  <li>• <strong>Copyright Compliance:</strong> Ensure you have rights to convert and use the uploaded files</li>
                  <li>• <strong>File Size Limits:</strong> Respect the 10MB per image and 50MB per PDF limits</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="mb-6 flex items-center gap-3 text-h2 text-foreground">
                <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shrink-0">4</span>
                Technical Limitations
              </h2>
              <div className="bg-muted rounded-field p-6 border-l-4 border-primary">
                <p className="text-base text-muted-foreground mb-4 flex items-start">
                  <Settings className="w-6 h-6 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Service Constraints:</strong> Our services have certain technical limitations for optimal performance.</span>
                </p>
                <ul className="text-base text-muted-foreground space-y-2">
                  <li>• <strong>File Formats:</strong> Supported formats include:<br/>
                    <span className="ml-4">• <strong>Image input:</strong> JPG/JPEG, PNG, WebP</span><br/>
                    <span className="ml-4">• <strong>Image output:</strong> JPG, PNG, WebP, PDF</span>
                  </li>
                  <li>• <strong>File Sizes:</strong> Maximum 10MB per image file, 50MB per PDF file</li>
                  <li>• <strong>Browser Requirements:</strong> Modern browsers with JavaScript enabled are required</li>
                  <li>• <strong>PDF Restrictions:</strong> Password-protected or encrypted PDFs are not supported</li>
                  <li>• <strong>Processing Time:</strong> Large files may take longer to process depending on your device</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="mb-6 flex items-center gap-3 text-h2 text-foreground">
                <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shrink-0">5</span>
                Limitation of Liability
              </h2>
              <div className="bg-muted rounded-field p-6 border-l-4 border-primary">
                <p className="text-base text-muted-foreground mb-4 flex items-start">
                  <AlertTriangle className="w-6 h-6 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Service Disclaimer:</strong> BravoConvert is provided "as is" without warranties.</span>
                </p>
                <ul className="text-base text-muted-foreground space-y-2">
                  <li>• <strong>No Guarantees:</strong> We do not guarantee 100% accuracy in file conversions</li>
                  <li>• <strong>User Responsibility:</strong> You are responsible for backing up your original files</li>
                  <li>• <strong>No Data Loss Claims:</strong> We are not liable for any data loss or file corruption</li>
                  <li>• <strong>Maximum Liability:</strong> Our liability is limited to the amount you paid for the service (which is $0)</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="mb-6 flex items-center gap-3 text-h2 text-foreground">
                <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shrink-0">6</span>
                Service Modifications
              </h2>
              <div className="bg-muted rounded-field p-6 border-l-4 border-primary">
                <p className="text-base text-muted-foreground mb-4 flex items-start">
                  <RotateCcw className="w-6 h-6 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Service Changes:</strong> We may modify or discontinue services as needed.</span>
                </p>
                <ul className="text-base text-muted-foreground space-y-2">
                  <li>• <strong>Feature Updates:</strong> We may add, modify, or remove features without notice</li>
                  <li>• <strong>Service Availability:</strong> Services may be temporarily unavailable for maintenance</li>
                  <li>• <strong>Format Support:</strong> Supported file formats may change over time</li>
                  <li>• <strong>No Compensation:</strong> No compensation is provided for service changes or discontinuation</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="mb-6 flex items-center gap-3 text-h2 text-foreground">
                <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shrink-0">7</span>
                Terms Updates
              </h2>
              <div className="bg-muted rounded-field p-6 border-l-4 border-primary">
                <p className="text-base text-muted-foreground mb-4 flex items-start">
                  <FileText className="w-6 h-6 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Policy Changes:</strong> These terms may be updated to reflect service changes or legal requirements.</span>
                </p>
                <ul className="text-base text-muted-foreground space-y-2">
                  <li>• <strong>Notification:</strong> Updated terms will be posted on this page</li>
                  <li>• <strong>Effective Date:</strong> Changes become effective immediately upon posting</li>
                  <li>• <strong>Continued Use:</strong> Continued use of services constitutes acceptance of new terms</li>
                  <li>• <strong>Opt-Out Option:</strong> You may stop using our services if you disagree with changes</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="mb-6 flex items-center gap-3 text-h2 text-foreground">
                <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shrink-0">8</span>
                Contact Information
              </h2>
              <div className="bg-muted rounded-field p-6 border-l-4 border-primary">
                <p className="text-base text-muted-foreground mb-4 flex items-start">
                  <Mail className="w-6 h-6 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Questions and Support:</strong> We're here to help with any questions about these terms.</span>
                </p>
                <ul className="text-base text-muted-foreground space-y-2">
                  <li>• <strong>Email:</strong> bravoconvert.help@gmail.com</li>
                  <li>• <strong>Response Time:</strong> We typically respond to inquiries within 1-4 weeks</li>
                  <li>• <strong>Legal Questions:</strong> For legal matters, please provide detailed information</li>
                </ul>
              </div>
            </div>
          </div>

          <hr className="my-12 border-border" />
          <div className="text-center bg-primary-soft rounded-field p-6 border border-transparent shadow-soft">
            <p className="text-base text-muted-foreground flex items-center justify-center mb-2">
              <Calendar className="w-6 h-6 text-muted-foreground mr-3" />
              <span><strong className="text-foreground">Effective Date:</strong> July 17, 2026</span>
            </p>
            <p className="text-sm text-muted-foreground">
              These terms apply to all BravoConvert services and may be updated as needed.
            </p>
          </div>
        </div>
        </div>
      </div>
    </main>
  );
}
