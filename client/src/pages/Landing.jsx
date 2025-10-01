import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Clarity Feed</h1>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-6 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-gray-900 tracking-tight leading-tight">
            Customer feedback,
            <br />
            <span className="text-blue-600">analyzed instantly</span>
          </h1>
          <p className="mt-8 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Stop manually sorting through feedback. Let AI identify patterns, sentiment, and urgent issues across thousands of customer responses.
          </p>
          <div className="mt-12 flex justify-center gap-4">
            {!isAuthenticated && (
              <>
                <Link
                  to="/register"
                  className="px-8 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3 text-base font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="text-blue-600 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Instant Analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Upload CSV files or paste feedback. Get sentiment, themes, and urgency levels in seconds using Claude AI.
              </p>
            </div>

            <div>
              <div className="text-blue-600 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Clear Insights</h3>
              <p className="text-gray-600 leading-relaxed">
                Interactive dashboards show sentiment distribution, top themes, and category breakdowns at a glance.
              </p>
            </div>

            <div>
              <div className="text-blue-600 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Priority Alerts</h3>
              <p className="text-gray-600 leading-relaxed">
                Critical feedback is automatically flagged so your team can respond to urgent issues first.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Simple process</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="relative">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-semibold">
                  1
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload feedback</h3>
              <p className="text-gray-600">CSV upload or manual entry. Supports customer reviews, support tickets, and survey responses.</p>
            </div>
            
            <div className="relative">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-semibold">
                  2
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI processes</h3>
              <p className="text-gray-600">Claude analyzes sentiment, categories, themes, and urgency for every piece of feedback.</p>
            </div>
            
            <div className="relative">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-semibold">
                  3
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">View insights</h3>
              <p className="text-gray-600">Interactive charts, executive summaries, and actionable recommendations ready instantly.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white">
            Start analyzing feedback today
          </h2>
          <p className="mt-6 text-xl text-blue-100">
            No credit card required. Create an account and start getting insights.
          </p>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="mt-10 inline-block px-8 py-3 text-base font-medium text-blue-600 bg-white rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sign Up
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2025 Clarity Feed
            </p>
            <p className="text-gray-400 text-sm">
              Built with React, Express & Claude AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}