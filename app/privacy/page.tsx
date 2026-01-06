export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mb-8">Last updated: January 6, 2026</p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Introduction</h2>
            <p>
              Welcome to Alpha Wings Post Booster ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and share information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>
            <p className="mb-3">We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Email address, name, and authentication credentials when you sign up</li>
              <li><strong>Content Data:</strong> Posts you generate, topics, tone preferences, and writing styles</li>
              <li><strong>Social Media Connections:</strong> When you connect your LinkedIn, Twitter, Facebook, or Instagram accounts, we receive access tokens to post on your behalf (only with your explicit permission)</li>
              <li><strong>Payment Information:</strong> Processed securely through Stripe (we do not store credit card details)</li>
              <li><strong>Usage Data:</strong> How you interact with our service, including posts generated, features used, and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <p className="mb-3">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our AI-powered content generation service</li>
              <li>Generate social media posts based on your preferences</li>
              <li>Post content to your connected social media accounts (only with your explicit consent)</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>Analyze usage patterns to improve our AI models and features</li>
              <li>Ensure security and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Information Sharing</h2>
            <p className="mb-3">We do not sell your personal information. We may share information in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>With Your Consent:</strong> When you authorize us to post to your social media accounts</li>
              <li><strong>Service Providers:</strong> With third-party vendors who help us operate our service (e.g., Supabase for database, Stripe for payments, OpenAI for AI generation)</li>
              <li><strong>Social Media Platforms:</strong> When you connect accounts, we use platform APIs (LinkedIn, Twitter, Facebook, Instagram) according to their terms</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Third-Party Services</h2>
            <p className="mb-3">Our service integrates with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>OpenAI:</strong> For AI content generation</li>
              <li><strong>Supabase:</strong> For secure data storage and authentication</li>
              <li><strong>Stripe:</strong> For payment processing</li>
              <li><strong>Vercel:</strong> For hosting and analytics</li>
              <li><strong>LinkedIn API:</strong> For posting to LinkedIn</li>
              <li><strong>Twitter API:</strong> For posting to Twitter/X</li>
              <li><strong>Facebook API:</strong> For posting to Facebook</li>
              <li><strong>Instagram API:</strong> For posting to Instagram</li>
            </ul>
            <p className="mt-3">Each service has its own privacy policy governing the use of your information.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your information. However, no method of transmission over the internet is 100% secure. We use industry-standard encryption, secure authentication, and Row Level Security (RLS) in our database.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Data Retention</h2>
            <p>
              We retain your information for as long as your account is active or as needed to provide services. You can delete your account and all associated data at any time through your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access the personal information we hold about you</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and data</li>
              <li>Disconnect social media accounts at any time</li>
              <li>Export your data</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Social Media Posting</h2>
            <p>
              When you connect a social media account, you grant us permission to post content on your behalf. You control what content is posted and can disconnect your accounts at any time. We only post content you explicitly generate and approve.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">10. Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our service and store certain information. You can instruct your browser to refuse all cookies or indicate when a cookie is being sent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">11. Children's Privacy</h2>
            <p>
              Our service is not intended for children under 13 years of age. We do not knowingly collect information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">12. International Users</h2>
            <p>
              Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for international data transfers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">13. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through our service. Your continued use of the service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">14. Contact Us</h2>
            <p className="mb-3">
              If you have questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="bg-blue-50 rounded-lg p-4">
              <p><strong>Email:</strong> hello@alphawingsai.com</p>
              <p><strong>Website:</strong> https://alphawings.com</p>
              <p><strong>LinkedIn:</strong> www.linkedin.com/in/sam-adeyemi-ai</p>
            </div>
          </section>

          <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">📋 Summary</h2>
            <p>
              <strong>In short:</strong> We collect only the information necessary to provide our AI content generation service. We use OpenAI to generate posts, Stripe for payments, and social media APIs to post content with your permission. We never sell your data. You control your information and can delete your account anytime.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <a href="/" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all inline-block">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
