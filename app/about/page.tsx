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


<section className="py-12 bg-white/50 backdrop-blur-sm">
  <div className="max-w-6xl mx-auto">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {[
        { number: '500+', label: 'Active Creators', icon: '👥' },
        { number: '50K+', label: 'Posts Generated', icon: '📝' },
        { number: '99%', label: 'Satisfaction Rate', icon: '⭐' },
        { number: '10x', label: 'Faster Creation', icon: '⚡' },
      ].map((stat, i) => (
        <div key={i} className="text-center p-6 bg-white rounded-xl shadow-lg">
          <div className="text-4xl mb-2">{stat.icon}</div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
            {stat.number}
          </div>
          <div className="text-gray-600">{stat.label}</div>
        </div>
      ))}
    </div>
  </div>
</section>
 
      {/* Mission Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              At Alpha Wings AI, we believe that every creator deserves to have a powerful voice on social media without spending hours crafting the perfect post.
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
                Our advanced AI creates engaging, platform-optimized content for LinkedIn, Twitter, Facebook, and Instagram,tailored to your unique voice and style.
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
              As a software developer and entrepreneur, I experienced this challenge firsthand. I saw brilliant researchers, innovative founders, and inspiring thought leaders struggle with content creation not because they lacked expertise, but because crafting engaging social media posts is a specialized skill that takes time to master.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              That's when I decided to build Alpha Wings an AI-powered tool that removes the friction from content creation, letting you focus on what you do best while we handle the rest.
            </p>
          </div>
        </div>
      </section>
	  
	  
<section className="py-20 bg-gradient-to-b from-white to-blue-50">
  <div className="max-w-4xl mx-auto px-6">
    <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
      Our Journey
    </h2>
    
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-500"></div>
      
      {[
        { year: '2023', title: 'Idea Born', desc: 'Recognized the content creation struggle among creators' },
        { year: 'Q1 2024', title: 'MVP Built', desc: 'First version with basic AI content generation' },
        { year: 'Q2 2024', title: 'Beta Launch', desc: '100+ early adopters joined the waitlist' },
        { year: 'Q3 2024', title: 'Multi-Platform', desc: 'Added LinkedIn, Twitter, Facebook, Instagram' },
        { year: 'Today', title: 'Public Launch', desc: 'Full-featured platform with smart scheduling' },
      ].map((milestone, i) => (
        <div key={i} className={`relative mb-12 ${i % 2 === 0 ? 'text-left' : 'text-right'}`}>
          <div className={`bg-white rounded-xl shadow-lg p-6 w-5/6 ${i % 2 === 0 ? 'ml-0 mr-auto' : 'ml-auto mr-0'}`}>
            <div className="text-sm font-semibold text-blue-600 mb-2">{milestone.year}</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
            <p className="text-gray-700">{milestone.desc}</p>
          </div>
          <div className="absolute top-6 w-4 h-4 bg-blue-600 rounded-full border-4 border-white"
               style={{ 
                 left: i % 2 === 0 ? 'calc(50% - 2rem)' : 'calc(50% + 2rem)',
                 transform: 'translateX(-50%)' 
               }}>
          </div>
        </div>
      ))}
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
	  
<section className="py-20 bg-gradient-to-b from-blue-50 to-white">
  <div className="max-w-6xl mx-auto px-6">
    <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
      Why Creators Choose Alpha Wings
    </h2>
    
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-6 text-left font-bold text-gray-900">Feature</th>
              <th className="p-6 text-center font-bold text-gray-900">Traditional Tools</th>
              <th className="p-6 text-center font-bold text-blue-600">Alpha Wings AI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[
              { feature: 'AI Content Generation', traditional: '❌ Manual only', alpha: '✅ GPT-4 Powered' },
              { feature: 'Platform Optimization', traditional: '✅ Basic', alpha: '✅ Intelligent' },
              { feature: 'Tone Customization', traditional: '❌ Limited', alpha: '✅ 10+ Voice Options' },
              { feature: 'Smart Scheduling', traditional: '✅ Basic', alpha: '✅ AI-Optimized Times' },
              { feature: 'Monthly Cost', traditional: '$80-$249', alpha: '$9.99-$99.99' },
              { feature: 'Setup Time', traditional: '2-3 hours', alpha: '5 minutes' },
            ].map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="p-6 font-medium text-gray-900">{row.feature}</td>
                <td className="p-6 text-center text-gray-700">{row.traditional}</td>
                <td className="p-6 text-center font-bold text-blue-600">{row.alpha}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
              href="https://www.linkedin.com/in/sam-adeyemi-ai/" 
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
	  

<section className="py-20 bg-gradient-to-b from-white to-blue-50">
  <div className="max-w-6xl mx-auto px-6">
    <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
      Loved by Creators Worldwide
    </h2>
    
    <div className="grid md:grid-cols-3 gap-8">
      {[
        {
          quote: "Alpha Wings cut my content creation time from 10 hours to 30 minutes per week. Absolutely revolutionary.",
          author: "Dr. Sarah Chen",
          role: "Research Scientist",
          avatar: "👩‍🔬"
        },
        {
          quote: "As a startup founder, I can't afford a marketing team. This tool gives me enterprise-level content on a bootstrap budget.",
          author: "Michael Rodriguez",
          role: "Tech Founder",
          avatar: "👨‍💼"
        },
        {
          quote: "The AI understands my niche so well. It's like having a personal content strategist available 24/7.",
          author: "Priya Sharma",
          role: "Content Creator",
          avatar: "👩‍🎨"
        }
      ].map((testimonial, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
          <div className="text-4xl mb-4">{testimonial.avatar}</div>
          <p className="text-gray-700 italic mb-6 text-lg">"{testimonial.quote}"</p>
          <div>
            <div className="font-bold text-gray-900">{testimonial.author}</div>
            <div className="text-gray-600">{testimonial.role}</div>
          </div>
        </div>
      ))}
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
              href="/login"
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
