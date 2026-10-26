import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Affiliate Disclosure',
  description: 'Affiliate Disclosure for FlyerFlow - Transparency about our affiliate relationships.',
}

export default function AffiliateDisclosurePage() {
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Affiliate Disclosure</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: {lastUpdated}</p>
          </header>

          <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">What This Means</h2>
              <p>
                FlyerFlow participates in affiliate marketing programs. This means that when you click on certain
                links on our website and make a purchase, we may earn a commission from the retailer at no
                additional cost to you.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Our Affiliate Partners</h2>
              <p>We currently have affiliate relationships with the following retailers:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Walmart Canada</li>
                <li>Canadian Tire</li>
                <li>Giant Tiger</li>
                <li>Dollarama</li>
              </ul>
              <p>
                These relationships are managed through affiliate networks (such as Commission Junction, Rakuten,
                or directly with the retailer). The specific network may vary by retailer.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">How It Works</h2>
              <ol className="list-decimal pl-6 space-y-3">
                <li>You browse deals on FlyerFlow</li>
                <li>You click a "Shop at [Store]" or "View Deal" button</li>
                <li>You are redirected to the retailer's website with a tracking parameter</li>
                <li>If you make a purchase (typically within a 24-30 day window), we may earn a commission</li>
              </ol>
              <p>
                The price you pay is the same whether you use our link or go directly to the retailer's website.
                The commission is paid by the retailer as a marketing expense.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Why We Use Affiliate Links</h2>
              <p>
                Running FlyerFlow involves costs including server hosting, domain registration, development time,
                and data processing. Affiliate commissions help cover these costs and allow us to keep the
                service free for users.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Editorial Independence</h2>
              <p>
                Our affiliate relationships do <strong>not</strong> influence:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Which deals we display</li>
                <li>The order in which deals appear</li>
                <li>Which retailers we include (we aim to cover all major chains in Toronto)</li>
                <li>The accuracy of prices, dates, or product information</li>
              </ul>
              <p>
                We show all current flyer deals from our partnered retailers regardless of commission rates.
                If a retailer doesn't have an affiliate program, we would still include their deals for completeness.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">How We Identify Affiliate Links</h2>
              <p>
                Affiliate links on FlyerFlow are clearly labeled as "Shop at [Store Name]" or "View Deal →".
                These links contain tracking parameters that identify FlyerFlow as the referrer.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Compliance</h2>
              <p>
                This disclosure complies with:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Canada Competition Act</strong> - Requirements for disclosure of material connections</li>
                <li><strong>Canadian Code of Advertising Standards</strong> - Clause 7: Testimonials, Endorsements & Reviews</li>
                <li><strong>FTC Endorsement Guides</strong> (applicable to US traffic) - Disclosure of material connections</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Choice</h2>
              <p>
                You are never obligated to use our affiliate links. You can always:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Search for the retailer directly in your browser</li>
                <li>Visit the retailer's website or app directly</li>
                <li>Use a different deal comparison website</li>
              </ul>
              <p>
                Using our links costs you nothing extra and helps support FlyerFlow. Thank you if you choose to!
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Contact</h2>
              <p>
                If you have questions about our affiliate relationships, please contact us at
                <a href="mailto:affiliates@flyerflow.ca" className="text-blue-600 hover:underline">affiliates@flyerflow.ca</a>.
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
            href="/privacy"
            className="text-blue-600 hover:underline mx-2"
          >
            Privacy Policy
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