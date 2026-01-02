export default function GDPRPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            GDPR Compliance
          </h1>
          <p className="text-gray-600 mb-8">Last updated: January 2, 2026</p>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment to GDPR</h2>
              <p>
                Alpha Wings AI is committed to protecting your personal data in accordance with the 
                General Data Protection Regulation (GDPR). This page outlines how we comply with GDPR 
                requirements and your rights under this regulation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights Under GDPR</h2>
              <p className="mb-4">As a data subject, you have the following rights:</p>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h3 className="font-bold text-gray-900 mb-2">📋 Right to Access</h3>
                  <p>You can request a copy of all personal data we hold about you.</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-xl">
                  <h3 className="font-bold text-gray-900 mb-2">✏️ Right to Rectification</h3>
                  <p>You can request correction of inaccurate or incomplete data.</p>
                </div>

                <div className="bg-red-50 p-4 rounded-xl">
                  <h3 className="font-bold text-gray-900 mb-2">🗑️ Right to Erasure</h3>
                  <p>You can request deletion of your personal data ("right to be forgotten").</p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-xl">
                  <h3 className="font-bold text-gray-900 mb-2">⛔ Right to Object</h3>
                  <p>You can object to processing of your personal data for specific purposes.</p>
                </div>

                <div className="bg-green-50 p-4 rounded-xl">
                  <h3 className="font-bold text-gray-900 mb-2">📦 Right to Data Portability</h3>
                  <p>You can request your data in a structured, machine-readable format.</p>
                </div>

                <div className="bg-indigo-50 p-4 rounded-xl">
                  <h3 className="font-bold text-gray-900 mb-2">🚫 Right to Restrict Processing</h3>
                  <p>You can request limitation of how we process your data.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Lawful Basis for Processing</h2>
              <p className="mb-4">We process your personal data based on the following legal grounds:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Consent:</strong> When you explicitly agree to data processing</li>
                <li><strong>Contract:</strong> To fulfill our service agreement with you</li>
                <li><strong>Legal Obligation:</strong> When required by law</li>
                <li><strong>Legitimate Interest:</strong> For business operations and improvements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data We Collect</h2>
              <p className="mb-4">We collect and process the following types of personal data:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Data:</strong> Name, email, password (encrypted)</li>
                <li><strong>Payment Data:</strong> Processed securely through Stripe (we don't store card details)</li>
                <li><strong>Usage Data:</strong> Posts generated, features used, login history</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
                <li><strong>Content Data:</strong> Generated posts and scheduling preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h2>
              <p className="mb-4">We retain your data for the following periods:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Active Accounts:</strong> Data retained while account is active</li>
                <li><strong>Deleted Accounts:</strong> 30 days retention, then permanent deletion</li>
                <li><strong>Payment Records:</strong> 7 years (legal requirement)</li>
                <li><strong>Analytics Data:</strong> Anonymized after 14 months</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">International Data Transfers</h2>
              <p>
                Your data may be transferred to and processed in countries outside the EU. We ensure 
                adequate protection through:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Standard Contractual Clauses (SCCs)</li>
                <li>EU-US Data Privacy Framework compliance</li>
                <li>Encryption during transit and at rest</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Security Measures</h2>
              <p className="mb-4">We implement robust security measures including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>256-bit SSL/TLS encryption</li>
                <li>Regular security audits</li>
                <li>Access controls and authentication</li>
                <li>Data backup and disaster recovery</li>
                <li>Staff training on data protection</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Breach Notification</h2>
              <p>
                In the unlikely event of a data breach affecting your personal data, we will:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Notify relevant authorities within 72 hours</li>
                <li>Inform affected users without undue delay</li>
                <li>Provide details of the breach and mitigation steps</li>
                <li>Take immediate action to prevent further breaches</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Exercise Your Rights</h2>
              <p className="mb-4">
                To exercise any of your GDPR rights, please:
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Email us at <strong>gdpr@alphawingsai.com</strong></li>
                <li>Include "GDPR Request" in the subject line</li>
                <li>Specify which right you wish to exercise</li>
                <li>Provide proof of identity (for security)</li>
              </ol>
              <p className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                ⏱️ We will respond to your request within <strong>30 days</strong> as required by GDPR.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Supervisory Authority</h2>
              <p>
                If you believe we have not handled your personal data properly, you have the right to 
                lodge a complaint with your local data protection authority:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <p><strong>UK:</strong> Information Commissioner's Office (ICO)</p>
                <p><strong>Website:</strong> <a href="https://ico.org.uk" className="text-blue-600 hover:underline">ico.org.uk</a></p>
                <p><strong>Phone:</strong> 0303 123 1113</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Our Data Protection Officer</h2>
              <p>
                For GDPR-related questions or concerns, contact our Data Protection Officer:
              </p>
              <p className="mt-4">
                <strong>Email:</strong> dpo@alphawingsai.com<br />
                <strong>GDPR Requests:</strong> gdpr@alphawingsai.com<br />
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
