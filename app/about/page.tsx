export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            About Alpha Wings AI
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Empowering creators, entrepreneurs, and businesses to soar higher with AI-powered content generation.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              At Alpha Wings AI, we believe that every creator deserves to have a powerful voice on social media—without spending hours crafting the perfect post.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              We're on a mission to democratize content creation by combining cutting-edge AI technology with intuitive design, making professional-quality social media content accessible to everyone.
            </p>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 px-6 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">What We Do</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow">
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered Generation</h3>
              <p className="text-gray-700 leading-relaxed">
                Our advanced AI creates engaging, platform-optimized content for LinkedIn, Twitter, Facebook, and Instagram—tailored to your unique voice and style.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Multi-Platform Publishing</h3>
              <p className="text-gray-700 leading-relaxed">
                Connect all your social accounts and publish to multiple platforms simultaneously. Save time and maintain consistency across your entire digital presence.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Customization</h3>
              <p className="text-gray-700 leading-relaxed">
                Choose from professional, casual, inspirational, or humorous tones. Our AI adapts to your brand voice and audience preferences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Alpha Wings AI was born from a simple observation: talented people with valuable ideas were spending more time worrying about social media than actually creating and building their businesses.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              As a software developer and entrepreneur, I experienced this challenge firsthand. I saw brilliant researchers, innovative founders, and inspiring thought leaders struggle with content creation—not because they lacked expertise, but because crafting engaging social media posts is a specialized skill that takes time to master.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              That's when I decided to build Alpha Wings—an AI-powered tool that removes the friction from content creation, letting you focus on what you do best while we handle the rest.
            </p>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-16 px-6 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Built With Cutting-Edge Technology</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="font-bold text-gray-900 mb-2">OpenAI GPT</h3>
              <p className="text-sm text-gray-600">Advanced AI models for intelligent content generation</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="text-4xl mb-3">⚛️</div>
              <h3 className="font-bold text-gray-900 mb-2">Next.js 14</h3>
              <p className="text-sm text-gray-600">Modern React framework for blazing-fast performance</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="text-4xl mb-3">🗄️</div>
              <h3 className="font-bold text-gray-900 mb-2">Supabase</h3>
              <p className="text-sm text-gray-600">Secure database and authentication system</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="text-4xl mb-3">💳</div>
              <h3 className="font-bold text-gray-900 mb-2">Stripe</h3>
              <p className="text-sm text-gray-600">Enterprise-grade payment processing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Who It's For</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-blue-600">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🎓 Researchers & Academics</h3>
              <p className="text-gray-700 leading-relaxed">
                Share your findings, build your reputation, and increase the impact of your research with professionally crafted posts.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-purple-600">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">💼 Entrepreneurs & Founders</h3>
              <p className="text-gray-700 leading-relaxed">
                Build your personal brand, attract investors, and grow your audience without hiring a content team.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-blue-600">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">📱 Content Creators</h3>
              <p className="text-gray-700 leading-relaxed">
                Maintain consistency across platforms, beat creative blocks, and scale your content production effortlessly.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-purple-600">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🏢 Small Businesses</h3>
              <p className="text-gray-700 leading-relaxed">
                Compete with larger brands on social media without breaking your budget or hiring an agency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Meet the Founder</h2>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl font-bold mb-4">Sam Adeyemi</h3>
            <p className="text-lg text-blue-100 leading-relaxed mb-4">
              Full-stack developer, AI enthusiast, and serial entrepreneur with a passion for building tools that solve real problems.
            </p>
            <p className="text-lg text-blue-100 leading-relaxed mb-6">
              With experience building SaaS applications, AI-powered research tools, and automation systems, Sam created Alpha Wings to help creators and entrepreneurs amplify their voice without the content creation burden.
            </p>
            <a 
              href="https://www.linkedin.com/in/sam-adeyemi-ai" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              <span>Connect on LinkedIn</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Elevate Your Content?
          </h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Join hundreds of creators who are already using Alpha Wings to scale their social media presence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/signup"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-2xl transition-all text-lg"
            >
              Get Started Free
            </a>
            <a 
              href="/pricing"
              className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-all text-lg"
            >
              View Pricing
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
