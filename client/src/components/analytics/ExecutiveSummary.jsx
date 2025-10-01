import { useState } from 'react';
import { analysisAPI } from '../../services/api';

export default function ExecutiveSummary({ projectId, initialSummary = null }) {
  const [summary, setSummary] = useState(initialSummary);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await analysisAPI.generateSummary(projectId);
      setSummary(data.summary);
      
    } catch (err) {
      console.error('Failed to generate summary:', err);
      setError(err.response?.data?.error || 'Failed to generate executive summary');
    } finally {
      setLoading(false);
    }
  };

  if (!summary && !loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Executive Summary</h3>
        <p className="text-sm text-gray-500 mb-4">
          Generate an AI-powered executive summary of all feedback
        </p>
        <button
          onClick={handleGenerate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Generate Executive Summary
        </button>
        {error && (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Executive Summary</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">Generating comprehensive summary...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Executive Summary</h3>
        <button
          onClick={handleGenerate}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Regenerate
        </button>
      </div>

      {/* Main Summary */}
      <div className="prose max-w-none mb-6">
        <p className="text-gray-700 whitespace-pre-line">{summary.summary}</p>
      </div>

      {/* Key Findings */}
      {summary.keyFindings && summary.keyFindings.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Key Findings
          </h4>
          <ul className="space-y-2">
            {summary.keyFindings.map((finding, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span className="text-sm text-gray-700">{finding}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Positive Highlights */}
        {summary.positiveHighlights && summary.positiveHighlights.length > 0 && (
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h4 className="text-sm font-semibold text-green-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              Positive Highlights
            </h4>
            <ul className="space-y-2">
              {summary.positiveHighlights.map((highlight, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-sm text-green-900">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Areas for Improvement */}
        {summary.areasForImprovement && summary.areasForImprovement.length > 0 && (
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <h4 className="text-sm font-semibold text-orange-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Areas for Improvement
            </h4>
            <ul className="space-y-2">
              {summary.areasForImprovement.map((area, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-orange-600 mr-2">!</span>
                  <span className="text-sm text-orange-900">{area}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {summary.recommendations && summary.recommendations.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Recommended Actions
          </h4>
          <ol className="space-y-2">
            {summary.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-blue-600 font-semibold mr-2">{idx + 1}.</span>
                <span className="text-sm text-blue-900">{rec}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}