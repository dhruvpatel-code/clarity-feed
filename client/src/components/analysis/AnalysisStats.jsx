export default function AnalysisStats({ stats }) {
  if (!stats || stats.total === 0) {
    return null;
  }

  const sentimentPercentage = (sentiment) => {
    return stats.total > 0 ? Math.round((stats.sentiment[sentiment] / stats.total) * 100) : 0;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Overview</h3>
      
      {/* Sentiment Distribution */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Sentiment Distribution</h4>
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="w-24 text-sm text-gray-600">Positive</div>
            <div className="flex-1 bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full"
                style={{ width: `${sentimentPercentage('positive')}%` }}
              ></div>
            </div>
            <div className="w-16 text-right text-sm font-medium text-gray-900">
              {stats.sentiment.positive} ({sentimentPercentage('positive')}%)
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-24 text-sm text-gray-600">Negative</div>
            <div className="flex-1 bg-gray-200 rounded-full h-4">
              <div
                className="bg-red-500 h-4 rounded-full"
                style={{ width: `${sentimentPercentage('negative')}%` }}
              ></div>
            </div>
            <div className="w-16 text-right text-sm font-medium text-gray-900">
              {stats.sentiment.negative} ({sentimentPercentage('negative')}%)
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-24 text-sm text-gray-600">Neutral</div>
            <div className="flex-1 bg-gray-200 rounded-full h-4">
              <div
                className="bg-gray-500 h-4 rounded-full"
                style={{ width: `${sentimentPercentage('neutral')}%` }}
              ></div>
            </div>
            <div className="w-16 text-right text-sm font-medium text-gray-900">
              {stats.sentiment.neutral} ({sentimentPercentage('neutral')}%)
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-24 text-sm text-gray-600">Mixed</div>
            <div className="flex-1 bg-gray-200 rounded-full h-4">
              <div
                className="bg-yellow-500 h-4 rounded-full"
                style={{ width: `${sentimentPercentage('mixed')}%` }}
              ></div>
            </div>
            <div className="w-16 text-right text-sm font-medium text-gray-900">
              {stats.sentiment.mixed} ({sentimentPercentage('mixed')}%)
            </div>
          </div>
        </div>
      </div>

      {/* Urgency Stats */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Urgent Issues</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-sm text-red-600 font-medium">Critical</p>
            <p className="text-2xl font-bold text-red-900">{stats.urgency.critical}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-orange-600 font-medium">High</p>
            <p className="text-2xl font-bold text-orange-900">{stats.urgency.high}</p>
          </div>
        </div>
      </div>

      {/* Average Sentiment Score */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Average Sentiment</h4>
        <div className="flex items-center">
          <div className="flex-1">
            <div className="bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full ${
                  stats.avgSentimentScore > 0 ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ 
                  width: `${Math.abs(stats.avgSentimentScore) * 50 + 50}%`,
                  marginLeft: stats.avgSentimentScore < 0 ? '0' : `${50 - Math.abs(stats.avgSentimentScore) * 50}%`
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Negative</span>
              <span>Neutral</span>
              <span>Positive</span>
            </div>
          </div>
          <div className="ml-4 text-lg font-bold text-gray-900">
            {stats.avgSentimentScore.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}