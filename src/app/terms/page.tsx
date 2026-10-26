import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for FlyerFlow - Find weekly sales at big-chain stores near you.',
}

export default function TermsPage() {
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Terms of Service</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: {lastUpdated}</p>
          </header>

          <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">1. Acceptance of Terms</h2>
              <p>
                By accessing and using FlyerFlow (the "Service"), you accept and agree to be bound by the terms
                and provision of this agreement. If you do not agree to abide by the above, please do not use
                this Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">2. Description of Service</h2>
              <p>
                FlyerFlow is a website that aggregates weekly flyer deals from major retail chains in Toronto,
                Ontario. We display sale items, prices, valid dates, and store locations to help you find the
                best deals near you. We do not sell products directly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">3. Use of the Service</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must be at least 13 years old to use this Service</li>
                <li>You agree to use the Service only for lawful purposes</li>
                <li>You agree not to scrape, crawl, or extract data from the Service without permission</li>
                <li>You agree not to interfere with the proper functioning of the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">4. Affiliate Links & Disclosure</h2>
              <p>
                FlyerFlow contains affiliate links to retailer websites. When you click on a "Shop at [Store]"
                or "View Deal" link and make a purchase, we may earn a commission at no additional cost to you.
                This helps support the operation of this website. See our <Link href="/affiliate-disclosure" className="text-blue-600 hover:underline">Affiliate Disclosure</Link> for more details.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">5. Data Accuracy</h2>
              <p>
                We strive to provide accurate and up-to-date information, but we cannot guarantee the accuracy,
                completeness, or timeliness of all data. Prices, availability, and sale dates may change without
                notice. Always verify details on the retailer's website before making a purchase.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">6. Intellectual Property</h2>
              <p>
                All content on FlyerFlow, including text, graphics, logos, and software, is the property of
                FlyerFlow or its licensors and is protected by copyright laws. Retailer logos and flyer content
                are the property of their respective owners.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">7. Limitation of Liability</h2>
              <p>
                FlyerFlow is provided "as is" without warranties of any kind. We are not liable for any
                damages arising from your use of the Service, including but not limited to direct, indirect,
                incidental, or consequential damages.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">8. Changes to Terms</h2>
              <p>
                We may modify these Terms at any time. Changes will be posted on this page with an updated
                "Last updated" date. Your continued use of the Service after changes constitutes acceptance
                of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">9. Contact</h2>
              <p>
                If you have questions about these Terms, please contact us at
                <a href="mailto:legal@flyerflow.ca" className="text-blue-600 hover:underline">legal@flyerflow.ca</a>.
              </p>
            </section>
          </div>
        </article>

        <nav className="mt-8 text-center" aria-label="Legal navigation">
          <Link
            href="/privacy"
            className="text-blue-600 hover:underline mx-2"
          >
            Privacy Policy
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