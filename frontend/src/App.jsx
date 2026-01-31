import './App.css'

function App() {

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                OmniConnect
              </h1>
            </div>

            {/* Sign Up Button */}
            <div>
              <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Animation / Illustration */}
            <div className="relative flex justify-center lg:justify-start">
              <div className="relative w-[320px] h-[420px] bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60">
                <div className="absolute inset-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-100">
                  <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">OmniConnect</span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                      Live
                    </span>
                  </div>

                  {/* Animated Message Flow */}
                  <div className="absolute top-16 left-6 right-6 space-y-4">
                    <div className="message-bubble bubble-left">
                      <span className="text-xs text-gray-600">Order confirmed</span>
                      <span className="text-[10px] text-gray-400">WhatsApp</span>
                    </div>
                    <div className="message-bubble bubble-right animation-delay-2">
                      <span className="text-xs text-gray-600">Shipment in transit</span>
                      <span className="text-[10px] text-gray-400">SMS</span>
                    </div>
                    <div className="message-bubble bubble-left animation-delay-4">
                      <span className="text-xs text-gray-600">Invoice sent</span>
                      <span className="text-[10px] text-gray-400">Email</span>
                    </div>
                  </div>

                  {/* Channel Icons Row */}
                  <div className="absolute bottom-8 left-6 right-6 grid grid-cols-3 gap-3">
                    <div className="channel-card">
                      <div className="channel-dot bg-green-500"></div>
                      <span>WhatsApp</span>
                    </div>
                    <div className="channel-card">
                      <div className="channel-dot bg-blue-500"></div>
                      <span>SMS</span>
                    </div>
                    <div className="channel-card">
                      <div className="channel-dot bg-indigo-500"></div>
                      <span>Email</span>
                    </div>
                  </div>
                </div>

                {/* Floating Connection Dots */}
                <div className="absolute -left-6 top-16 w-12 h-12 rounded-full bg-blue-100 shadow-md float-slow"></div>
                <div className="absolute -right-6 bottom-16 w-10 h-10 rounded-full bg-indigo-100 shadow-md float-slower"></div>
              </div>
            </div>

            {/* Right Content */}
            <div className="text-center lg:text-left">
              {/* Hero Headline */}
              <h2 className="text-center  text-5xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Reliable Multi-Channel Business Messaging,{'   '}
                <span className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Without the Chaos
                </span>
              </h2>

              {/* Hero Description */}
              <p className="text-center text--0.5xl text-gray-600 mb-12 max-w-3xl lg:max-w-none leading-relaxed">
                OmniConnect helps businesses send automated notifications seamlessly across 
                WhatsApp, SMS, and Email with intelligent fallback routing. Never miss a 
                customer message again with our unified messaging platform.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">WhatsApp Integration</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">SMS Fallback</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Email Delivery</span>
                </div>
              </div>

              {/* Workspace Search */}
              <div className="max-w-xl mx-auto lg:mx-0">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900">Join a Workspace</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Search for an organization to join their workspace</p>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search organizations..."
                      className="w-full px-4 py-3 pl-11 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                    />
                    <svg
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Body Section - CTA */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            {/* Main CTA Button */}
            <button className="group relative px-12 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
              <span className="relative z-10 flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Create Workspace
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            {/* Secondary Text */}
            <p className="mt-6 text-sm text-gray-500">
              Your centralized hub for managing multi-channel notifications across your entire organization
            </p>

            {/* Stats */}
            
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="text-sm">
              © 2026 OmniConnect. All rights reserved.
            </div>

            {/* Links */}
            <div className="flex gap-8">
              <a href="#about" className="text-sm hover:text-white transition-colors">
                About
              </a>
              <a href="#contact" className="text-sm hover:text-white transition-colors">
                Contact
              </a>
              <a href="#privacy" className="text-sm hover:text-white transition-colors">
                Privacy Policy
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-sm text-gray-500">
              Built with ❤️ for modern businesses
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
