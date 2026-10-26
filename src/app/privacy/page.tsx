import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for FlyerFlow - How we collect, use, and protect your information.',
}

export default function PrivacyPage() {
  const lastUpdated = 'October 26, 2026'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40" role="banner">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="text-2xl font-bold text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded"
              aria-label="FlyerFlow home"
            >
              FlyerFlow
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-3xl mx-auto px-4 py-12" role="main">
        <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <header className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: {lastUpdated}</p>
          </header>

          <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">1. Information We Collect</h2>
              <p>We collect minimal information to provide our service:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Location data:</strong> When you grant permission, we receive your approximate location (latitude/longitude) to show nearby stores and deals. This is processed in your browser and sent to our API only to fetch relevant results.</li>
                <li><strong>Manual location input:</strong> If you enter an address or postal code manually, we send it to OpenStreetMap's Nominatim service for geocoding.</li>
                <li><strong>Usage data:</strong> We may collect anonymous usage statistics (page views, filter usage) via Plausible Analytics if enabled. No personal identifiers are collected.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>To show you relevant stores and sales near your location</li>
                <li>To improve the Service based on anonymous usage patterns</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">3. Data Sharing</h2>
              <p>We do not sell your personal information. We may share data with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>OpenStreetMap/Nominatim:</strong> For geocoding manual location searches (only the address you enter)</li>
                <li><strong>Retailer websites:</strong> When you click affiliate links, the retailer may receive referrer information</li>
                <li><strong>Analytics provider (Plausible):</strong> Anonymous usage data if analytics is enabled</li>
                <li><strong>Legal authorities:</strong> When required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">4. Data Retention</h2>
              <p>
                Location data is not stored on our servers beyond the active session. Anonymous analytics data
                is retained per Plausible's data retention policy (typically 6 months). Server logs are retained
                for up to 30 days for security and debugging.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">5. Your Rights</h2>
              <p>Under applicable privacy laws (including PIPEDA in Canada), you have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal data</li>
                <li>Request correction or deletion of your data</li>
                <li>Object to processing</li>
                <li>Withdraw consent (e.g., revoke location permission in browser settings)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">6. Cookies & Local Storage</h2>
              <p>
                FlyerFlow does not use cookies for tracking. We may use browser localStorage to remember
                your filter preferences (selected chains, radius, view mode). You can clear this at any time
                via your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">7. Third-Party Services</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>OpenStreetMap Nominatim:</strong> Geocoding service for manual location search. <a href="https://operations.osmfoundation.org/policies/privacy/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Privacy Policy</a></li>
                <li><strong>Plausible Analytics:</strong> Privacy-friendly analytics (if enabled). <a href="https://plausible.io/data-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Data Policy</a></li>
                <li><strong>Retailer websites:</strong> When you click affiliate links, you are subject to their privacy policies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">8. Children's Privacy</h2>
              <p>
                Our Service is not directed to children under 13. We do not knowingly collect personal
                information from children under 13. If you believe we have collected such information,
                please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Changes will be posted on this page
                with an updated "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">10. Contact</h2>
              <p>
                If you have questions about this Privacy Policy or want to exercise your rights, contact us at
                <a href="mailto:privacy@flyerflow.ca" className="text-blue-600 hover:underline">privacy@flyerflow.ca</a>.
              </p>
            </section>
          </div>
        </article>

        <nav className="mt-8 text-center" aria-label="Legal navigation">
          <Link
            href="/terms"
            className="text-blue-600 hover:underline mx-2"
          >
            Terms of Service
          </Link>
          <span className="text-gray-400 mx-2">|</span>
          <Link
            href="/affiliate-disclosure"
            className="text-blue-600 hover:underline mx-2"
          >
            Affiliate Disclosure
          </Link>
        </nav>
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; 2026 FlyerFlow. All rights reserved.
        </div>
      </footer>
    </div>
  )
}