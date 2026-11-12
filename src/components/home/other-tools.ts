import { Combine, FileText, Image, PencilRuler } from "lucide-react";

/** The four everyday tools, shown as cards on the home page and on the 404 page. */
export const OTHER_TOOLS = [
  {
    href: "/convert/img/",
    icon: Image,
    title: "Image Converter",
    points: ["JPG, PNG, WebP and PDF", "Batch conversion with ZIP download", "Output carries no source EXIF"],
    use: "Use this to clean a batch of photos, switch formats, or combine photos into one PDF",
  },
  {
    href: "/convert/pdf/",
    icon: FileText,
    title: "PDF to Image",
    points: ["Convert PDF to JPG or PNG", "One image per page", "The PDF never leaves your device"],
    use: "Use this to share a single page as a picture instead of sending the whole document",
  },
  {
    href: "/edit/image/",
    icon: PencilRuler,
    title: "Image Editor",
    points: ["Resize with aspect ratio lock", "Rotate and flip", "Export JPG, PNG, or WebP"],
    use: "Use this to fix or resize one photo — the export does not copy the original's EXIF block",
  },
  {
    href: "/edit/pdf/",
    icon: Combine,
    title: "Merge & Split PDF",
    points: ["Combine several PDFs into one", "Extract pages or split every page", "No upload, text stays selectable"],
    use: "Use this to send only the pages someone needs, without uploading the document to a service",
  },
];

export const OTHER_TOOL_TONES = ["blue", "pink", "yellow", "green"] as const;
