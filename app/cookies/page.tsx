export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Cookie Policy
          </h1>
          <p className="text-gray-600 mb-8">Last updated: January 2, 2026</p>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
              <p>
                Cookies are small text files that are placed on your device when you visit our website. 
                They help us provide you with a better experience by remembering your preferences and 
                understanding how you use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Cookies</h2>
              <p className="mb-4">We use cookies for the following purposes:</p>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h3 className="font-bold text-gray-900 mb-2">🔐 Essential Cookies</h3>
                  <p>Required for the website to function properly. These include authentication cookies that keep you logged in.</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-xl">
                  <h3 className="font-bold text-gray-900 mb-2">📊 Analytics Cookies</h3>
                  <p>Help us understand how visitors interact with our website by collecting anonymous information.</p>
                </div>

                <div className="bg-green-50 p-4 rounded-xl">
                  <h3 className="font-bold text-gray-900 mb-2">⚙️ Preference Cookies</h3>
                  <p>Remember your settings and preferences, such as language and display options.</p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-xl">
                  <h3 className="font-bold text-gray-900 mb-2">🎯 Marketing Cookies</h3>
                  <p>Track your activity to show you relevant advertisements (with your consent).</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
              <p className="mb-4">We use the following third-party services that may set cookies:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Vercel Analytics:</strong> Website performance monitoring</li>
                <li><strong>Stripe:</strong> Payment processing</li>
                <li><strong>Supabase:</strong> Authentication and database services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Cookies</h2>
              <p className="mb-4">
                You can control and manage cookies in several ways:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Browser Settings:</strong> Most browsers allow you to refuse or delete cookies</li>
                <li><strong>Opt-Out Tools:</strong> Use browser extensions to block tracking cookies</li>
                <li><strong>Cookie Preferences:</strong> Adjust your preferences in our cookie banner</li>
              </ul>
              <p className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                ⚠️ <strong>Note:</strong> Disabling essential cookies may affect the functionality of our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookie Duration</h2>
              <p className="mb-4">We use both session and persistent cookies:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
                <li><strong>Persistent Cookies:</strong> Remain on your device for a set period (up to 1 year)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
              <p>
                Under GDPR and other privacy laws, you have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Know what cookies we use</li>
                <li>Consent to non-essential cookies</li>
                <li>Withdraw your consent at any time</li>
                <li>Delete cookies from your device</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Policy</h2>
              <p>
                We may update this Cookie Policy from time to time. Any changes will be posted on this 
                page with an updated revision date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p>
                If you have questions about our use of cookies, please contact us at:
              </p>
              <p className="mt-4">
                <strong>Email:</strong> privacy@alphawingsai.com<br />
                <strong>Website:</strong> alphawingsai.com
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <a 
              href="/"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
