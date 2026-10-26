/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://flyerflow.ca',
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  exclude: ['/api/*', '/_next/*', '/static/*'],
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: '/api/' },
    ],
    additionalSitemaps: [
      'https://flyerflow.ca/sitemap.xml',
    ],
  },
  transform: async (config, path) => {
    const priorityMap = {
      '/': 1.0,
    };
    const changefreqMap = {
      '/': 'daily',
    };

    return {
      loc: path,
      changefreq: changefreqMap[path] || 'weekly',
      priority: priorityMap[path] || 0.7,
      lastmod: new Date().toISOString(),
      alternateRefs: config.alternateRefs ?? [],
    };
  },
  additionalPaths: async (config) => [
    // Add dynamic paths here when we have store/sale pages
    // { loc: '/stores/walmart-ca-123', changefreq: 'daily', priority: 0.8 },
  ],
};