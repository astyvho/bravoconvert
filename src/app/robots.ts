import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://bravoconvert.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/ads.txt'],
        disallow: [
          '/private/',
          '/api/',
          '/admin/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/ads.txt'],
        disallow: ['/private/'],
      },
      {
        userAgent: 'Mediapartners-Google',
        allow: ['/', '/ads.txt'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
