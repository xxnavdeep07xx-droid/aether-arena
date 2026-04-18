import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://aetherarena.com', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://aetherarena.com/tournaments', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://aetherarena.com/leaderboard', lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ]
}
