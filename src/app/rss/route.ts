import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = 'https://bravoconvert.com'
  
  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>BravoConvert - File Conversion Tools</title>
    <description>Convert images and PDFs for free, fast, and securely in your browser. No installation required.</description>
    <link>${baseUrl}</link>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss" rel="self" type="application/rss+xml"/>
    
    <item>
      <title>BravoConvert - Free Online File Conversion Tools</title>
      <description>Convert images and PDFs for free, fast, and securely in your browser. Batch upload, bulk conversion, privacy protected.</description>
      <link>${baseUrl}</link>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <guid isPermaLink="false">${baseUrl}-home</guid>
    </item>
    

    
    <item>
      <title>Image Converter - PNG, JPG, WebP, GIF</title>
      <description>Convert PNG, JPG, WebP, GIF images for free. Fast, secure, and works directly in your browser.</description>
      <link>${baseUrl}/convert/img</link>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <guid isPermaLink="false">${baseUrl}-convert-img</guid>
    </item>
    
    <item>
      <title>PDF to Image Converter</title>
      <description>Convert PDF files to JPG and PNG images. High-quality conversion with page splitting support.</description>
      <link>${baseUrl}/convert/pdf</link>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <guid isPermaLink="false">${baseUrl}-convert-pdf</guid>
    </item>
    

    
    <item>
      <title>How to Use BravoConvert</title>
      <description>Learn how to convert your files easily with our step-by-step guide.</description>
      <link>${baseUrl}/how-to-use</link>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <guid isPermaLink="false">${baseUrl}-how-to-use</guid>
    </item>
    
    <item>
      <title>FAQ - BravoConvert File Converters</title>
      <description>Frequently asked questions about BravoConvert file conversion tools. Find answers to common questions.</description>
      <link>${baseUrl}/faq</link>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <guid isPermaLink="false">${baseUrl}-faq</guid>
    </item>
    
    <item>
      <title>Privacy Policy - BravoConvert</title>
      <description>Read our privacy policy to understand how we protect your data.</description>
      <link>${baseUrl}/privacy-policy</link>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <guid isPermaLink="false">${baseUrl}-privacy</guid>
    </item>
    
    <item>
      <title>Terms of Service - BravoConvert</title>
      <description>Read our terms of service for using BravoConvert file conversion tools.</description>
      <link>${baseUrl}/terms</link>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <guid isPermaLink="false">${baseUrl}-terms</guid>
    </item>
  </channel>
</rss>`

  return new NextResponse(rssXml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // 1시간 캐시
    },
  })
} 