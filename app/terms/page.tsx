export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        <p className="text-sm text-gray-600 mb-8">Last updated: January 6, 2026</p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>
              Welcome to Alpha Wings AI Post Booster ("Service," "we," "us," or "our"). By accessing or using our Service, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Description of Service</h2>
            <p className="mb-3">
              Alpha Wings AI Post Booster is an AI-powered content generation platform that helps users create and publish social media posts across multiple platforms including LinkedIn, Twitter, Facebook, and Instagram.
            </p>
            <p>
              Our Service uses artificial intelligence to generate content based on your inputs, preferences, and selected parameters. We provide tools for content customization, scheduling, and multi-platform publishing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Account Registration and Security</h2>
            <p className="mb-3">To use our Service, you must:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Be at least 13 years of age (or the minimum age required in your jurisdiction)</li>
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized access to your account</li>
              <li>Be responsible for all activities that occur under your account</li>
            </ul>
            <p className="mt-3">
              You may not share your account credentials or allow others to access your account. We reserve the right to terminate accounts that violate these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Subscription Plans and Billing</h2>
            <p className="mb-3">
              <strong>4.1 Paid Subscriptions:</strong> We offer various subscription tiers with different features and usage limits. Subscription fees are billed in advance on a monthly or annual basis.
            </p>
            <p className="mb-3">
              <strong>4.2 Payment Processing:</strong> All payments are processed securely through Stripe. By providing payment information, you authorize us to charge your payment method for all fees associated with your subscription.
            </p>
            <p className="mb-3">
              <strong>4.3 Automatic Renewal:</strong> Subscriptions automatically renew at the end of each billing period unless you cancel before the renewal date.
            </p>
            <p className="mb-3">
              <strong>4.4 Cancellation:</strong> You may cancel your subscription at any time through your account settings. Cancellations take effect at the end of the current billing period. We do not provide refunds for partial months or unused portions of your subscription.
            </p>
            <p className="mb-3">
              <strong>4.5 Price Changes:</strong> We may modify subscription prices with 30 days' advance notice. Price changes will apply to subsequent billing periods after notification.
            </p>
            <p>
              <strong>4.6 Free Trial:</strong> New users may receive a free trial period. We may require payment information to activate a trial. If you do not cancel before the trial ends, you will be charged for the subscription.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Usage Limits and Fair Use</h2>
            <p className="mb-3">
              Your subscription plan includes specific usage limits (e.g., number of posts generated, API calls, storage). We reserve the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Enforce reasonable usage limits to ensure fair access for all users</li>
              <li>Throttle or temporarily suspend accounts that exceed reasonable usage patterns</li>
              <li>Terminate accounts engaged in abusive or automated bulk usage</li>
            </ul>
            <p className="mt-3">
              "Fair use" means using the Service as intended for content creation, not for data scraping, API abuse, or reselling access to our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Content Ownership and License</h2>
            <p className="mb-3">
              <strong>6.1 Your Content:</strong> You retain all ownership rights to content you input into our Service and content generated by our AI based on your inputs.
            </p>
            <p className="mb-3">
              <strong>6.2 License to Us:</strong> By using our Service, you grant us a limited, non-exclusive license to use, store, and process your content solely to provide and improve the Service.
            </p>
            <p className="mb-3">
              <strong>6.3 AI-Generated Content:</strong> Content generated by our AI is provided to you for your use. However, AI-generated content may not be unique and similar content may be generated for other users based on similar inputs.
            </p>
            <p>
              <strong>6.4 Third-Party Platforms:</strong> When you publish content to social media platforms through our Service, you remain subject to those platforms' terms of service and content policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Social Media Integration</h2>
            <p className="mb-3">
              <strong>7.1 Authorization:</strong> When you connect social media accounts, you authorize us to post content on your behalf using platform APIs.
            </p>
            <p className="mb-3">
              <strong>7.2 Your Responsibility:</strong> You are solely responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Content posted to your social media accounts through our Service</li>
              <li>Compliance with each platform's terms of service and community guidelines</li>
              <li>Ensuring you have rights to publish any content you generate or upload</li>
              <li>Reviewing content before publishing</li>
            </ul>
            <p className="mt-3">
              <strong>7.3 Platform Changes:</strong> Social media platforms may change their APIs, policies, or terms at any time. We are not responsible for disruptions caused by third-party platform changes.
            </p>
            <p className="mt-3">
              <strong>7.4 Disconnection:</strong> You may disconnect social media accounts at any time through your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Acceptable Use Policy</h2>
            <p className="mb-3">You agree NOT to use our Service to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Generate or distribute illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or hateful content</li>
              <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity</li>
              <li>Generate spam, unsolicited messages, or engage in any form of harassment</li>
              <li>Violate any applicable laws, regulations, or third-party rights</li>
              <li>Distribute malware, viruses, or any malicious code</li>
              <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
              <li>Interfere with or disrupt the Service or servers/networks connected to the Service</li>
              <li>Reverse engineer, decompile, or disassemble any portion of the Service</li>
              <li>Use the Service to compete with us or build a competing product</li>
              <li>Resell, sublicense, or distribute access to the Service without authorization</li>
            </ul>
            <p className="mt-3">
              Violation of this policy may result in immediate account termination without refund.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">9. AI Content Disclaimer</h2>
            <p className="mb-3">
              Our Service uses artificial intelligence to generate content. You acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>AI-generated content may contain errors, inaccuracies, or inappropriate material</li>
              <li>You must review and verify all AI-generated content before publishing</li>
              <li>We do not guarantee the accuracy, completeness, or quality of AI-generated content</li>
              <li>AI-generated content should not be considered professional advice (legal, medical, financial, etc.)</li>
              <li>You are solely responsible for fact-checking and ensuring content accuracy</li>
              <li>We are not liable for consequences resulting from use of AI-generated content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">10. Intellectual Property Rights</h2>
            <p className="mb-3">
              <strong>10.1 Our IP:</strong> The Service, including its software, design, features, functionality, text, graphics, logos, and trademarks, are owned by Alpha Wings AI and protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p className="mb-3">
              <strong>10.2 License to Use:</strong> We grant you a limited, non-exclusive, non-transferable license to access and use the Service for your personal or internal business purposes, subject to these Terms.
            </p>
            <p>
              <strong>10.3 Restrictions:</strong> You may not copy, modify, distribute, sell, or lease any part of our Service without explicit written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">11. Service Availability and Modifications</h2>
            <p className="mb-3">
              <strong>11.1 Uptime:</strong> We strive to maintain high Service availability but do not guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance, updates, or technical issues.
            </p>
            <p className="mb-3">
              <strong>11.2 Modifications:</strong> We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time, with or without notice.
            </p>
            <p>
              <strong>11.3 Updates:</strong> We may release updates, new features, or changes to the Service. Your continued use constitutes acceptance of such changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">12. Data and Privacy</h2>
            <p>
              Your use of the Service is also governed by our Privacy Policy, which explains how we collect, use, and protect your information. By using the Service, you consent to our data practices as described in the Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">13. Disclaimers and Limitations of Liability</h2>
            <p className="mb-3">
              <strong>13.1 "AS IS" Basis:</strong> THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>
            <p className="mb-3">
              <strong>13.2 No Guarantees:</strong> We do not warrant that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The Service will be uninterrupted, secure, or error-free</li>
              <li>AI-generated content will meet your requirements or expectations</li>
              <li>Any errors or defects will be corrected</li>
              <li>The Service will be compatible with all devices or platforms</li>
            </ul>
            <p className="mt-3">
              <strong>13.3 Limitation of Liability:</strong> TO THE MAXIMUM EXTENT PERMITTED BY LAW, ALPHA WINGS AI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR USE, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
            <p className="mt-3">
              <strong>13.4 Maximum Liability:</strong> Our total liability to you for all claims arising from or related to the Service shall not exceed the amount you paid us in the 12 months preceding the claim, or $100, whichever is greater.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">14. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless Alpha Wings AI, its officers, directors, employees, and agents from any claims, liabilities, damages, losses, costs, or expenses (including reasonable attorneys' fees) arising from: (a) your use of the Service; (b) content you generate or publish; (c) violation of these Terms; (d) violation of any third-party rights; or (e) violation of applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">15. Third-Party Services and Links</h2>
            <p>
              Our Service may contain links to third-party websites or integrate with third-party services (e.g., social media platforms, payment processors). We are not responsible for the content, privacy practices, or terms of service of third parties. Your interactions with third parties are solely between you and them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">16. Termination</h2>
            <p className="mb-3">
              <strong>16.1 By You:</strong> You may terminate your account at any time through your account settings or by contacting us.
            </p>
            <p className="mb-3">
              <strong>16.2 By Us:</strong> We may suspend or terminate your account immediately, without prior notice, if:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You violate these Terms or our Acceptable Use Policy</li>
              <li>Your account shows signs of fraudulent or abusive activity</li>
              <li>We are required to do so by law</li>
              <li>We discontinue the Service</li>
            </ul>
            <p className="mt-3">
              <strong>16.3 Effect of Termination:</strong> Upon termination, your right to use the Service immediately ceases. We may delete your account data after termination. Provisions that by their nature should survive termination shall survive (e.g., ownership, disclaimers, limitations of liability).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">17. Export Compliance</h2>
            <p>
              You agree to comply with all applicable export and import control laws and regulations. You represent that you are not located in a country subject to a U.S. Government embargo or designated as a "terrorist supporting" country, and you are not on any U.S. Government list of prohibited or restricted parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">18. Dispute Resolution and Governing Law</h2>
            <p className="mb-3">
              <strong>18.1 Governing Law:</strong> These Terms shall be governed by and construed in accordance with the laws of the United Kingdom, without regard to its conflict of law provisions.
            </p>
            <p className="mb-3">
              <strong>18.2 Dispute Resolution:</strong> Any disputes arising from these Terms or your use of the Service shall first be attempted to be resolved through good-faith negotiation between the parties.
            </p>
            <p>
              <strong>18.3 Jurisdiction:</strong> If negotiation fails, disputes shall be resolved in the courts located in the United Kingdom, and you consent to the personal jurisdiction of such courts.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">19. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. We will notify you of material changes by email or through a notice on the Service. Your continued use of the Service after changes take effect constitutes acceptance of the modified Terms. If you do not agree to the changes, you must stop using the Service and cancel your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">20. General Provisions</h2>
            <p className="mb-3">
              <strong>20.1 Entire Agreement:</strong> These Terms, together with our Privacy Policy, constitute the entire agreement between you and Alpha Wings AI regarding the Service.
            </p>
            <p className="mb-3">
              <strong>20.2 Severability:</strong> If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
            </p>
            <p className="mb-3">
              <strong>20.3 Waiver:</strong> Our failure to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision.
            </p>
            <p className="mb-3">
              <strong>20.4 Assignment:</strong> You may not assign or transfer these Terms or your account without our prior written consent. We may assign our rights and obligations without restriction.
            </p>
            <p>
              <strong>20.5 Force Majeure:</strong> We shall not be liable for any failure or delay in performance due to causes beyond our reasonable control, including acts of God, natural disasters, war, terrorism, labor disputes, or government actions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">21. Contact Information</h2>
            <p className="mb-3">
              If you have questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-blue-50 rounded-lg p-4">
              <p><strong>Email:</strong> hello@alphawingsai.com</p>
              <p><strong>Website:</strong> https://alphawings.com</p>
              <p><strong>LinkedIn:</strong> https://www.linkedin.com/in/sam-adeyemi-ai/</p>
            </div>
          </section>

          <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">📋 Summary</h2>
            <p>
              <strong>In short:</strong> Use Alpha Wings AI responsibly and ethically. You own your content. We provide the Service "as is" and are not liable for AI-generated content issues. Review everything before publishing. You're responsible for what you post to social media. We can modify or terminate the Service at any time. Pay your subscription on time. Don't abuse the system or violate platform policies.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all inline-block">
              ← Back to Home
            </a>
            <a href="/privacy" className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all inline-block">
              View Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
