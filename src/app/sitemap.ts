import { MetadataRoute } from 'next'
import { KO_PATHS, koPath } from '@/lib/locale'

// `next dev` mounts sitemap.ts at /sitemap.xml/[[...__metadata_id__]] and, under
// `output: 'export'`, answers 500 ("missing generateStaticParams()") unless the one
// path is listed. The build already flattens it to /sitemap.xml, so this only fixes dev.
export const dynamic = 'force-static'
export function generateStaticParams() {
  return [{ __metadata_id__: [] }]
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bravoconvert.com'
  const currentDate = new Date()

  const entries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1,
    },

    {
      url: `${baseUrl}/convert/img/`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/convert/pdf/`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/edit/image/`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/edit/pdf/`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/view/exif/`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },

    {
      url: `${baseUrl}/how-to-use/`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq/`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guides/`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guides/jpg-png-webp-comparison/`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guides/reduce-image-file-size/`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guides/pdf-to-image-use-cases/`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guides/exif-metadata-privacy/`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guides/pdf-metadata-privacy/`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guides/troubleshooting/`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guides/glossary/`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/changelog/`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy-policy/`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms/`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/about/`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact/`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]

  // 한국어판이 있는 페이지는 양쪽 항목에 hreflang 대응을 적고, 한국어 URL도 따로 올린다.
  const languagesFor = (path: string) => ({
    languages: { en: `${baseUrl}${path}`, ko: `${baseUrl}${koPath(path)}` },
  })
  const withAlternates = entries.map((entry) => {
    const path = entry.url === baseUrl ? '/' : entry.url.slice(baseUrl.length)
    return (KO_PATHS as readonly string[]).includes(path) ? { ...entry, alternates: languagesFor(path) } : entry
  })
  const korean: MetadataRoute.Sitemap = KO_PATHS.map((path) => ({
    url: `${baseUrl}${koPath(path)}`,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: path === '/' ? 0.9 : 0.8,
    alternates: languagesFor(path),
  }))

  return [...withAlternates, ...korean]
}
