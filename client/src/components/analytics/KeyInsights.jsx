import { useEffect, useState } from 'react';

export default function KeyInsights({ stats, analyses }) {
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    if (!stats || !analyses || analyses.length === 0) return;

    const newInsights = [];

    // Sentiment insights
    const totalSentiment = stats.sentiment.positive + stats.sentiment.negative + 
                          stats.sentiment.neutral + stats.sentiment.mixed;
    if (totalSentiment > 0) {
      const positivePercent = Math.round((stats.sentiment.positive / totalSentiment) * 100);
      const negativePercent = Math.round((stats.sentiment.negative / totalSentiment) * 100);

      if (positivePercent >= 70) {
        newInsights.push({
          type: 'positive',
          icon: '🎉',
          title: 'Strong Positive Sentiment',
          description: `${positivePercent}% of feedback is positive. Customers are generally satisfied.`
        });
      } else if (negativePercent >= 40) {
        newInsights.push({
          type: 'negative',
          icon: '⚠️',
          title: 'High Negative Feedback',
          description: `${negativePercent}% of feedback is negative. Immediate action recommended.`
        });
      }
    }

    // Urgency insights
    if (stats.urgency.critical > 0) {
      newInsights.push({
        type: 'urgent',
        icon: '🚨',
        title: 'Critical Issues Detected',
        description: `${stats.urgency.critical} critical issues require immediate attention.`
      });
    }

    // Theme insights
    const themeCounts = {};
    analyses.forEach(analysis => {
      if (analysis.themes && Array.isArray(analysis.themes)) {
        analysis.themes.forEach(theme => {
          themeCounts[theme] = (themeCounts[theme] || 0) + 1;
        });
      }
    });

    const topTheme = Object.entries(themeCounts)
      .sort(([, a], [, b]) => b - a)[0];

    if (topTheme) {
      newInsights.push({
        type: 'info',
        icon: '💡',
        title: 'Most Common Topic',
        description: `"${topTheme[0]}" is mentioned ${topTheme[1]} times across feedback.`
      });
    }

    // Average sentiment
    if (stats.avgSentimentScore !== undefined) {
      const score = stats.avgSentimentScore;
      let sentiment = 'neutral';
      if (score > 0.3) sentiment = 'positive';
      else if (score < -0.3) sentiment = 'negative';

      newInsights.push({
        type: sentiment === 'positive' ? 'positive' : sentiment === 'negative' ? 'negative' : 'info',
        icon: sentiment === 'positive' ? '😊' : sentiment === 'negative' ? '😞' : '😐',
        title: 'Average Sentiment Score',
        description: `Overall sentiment score is ${score.toFixed(2)} out of 1.0 (${sentiment}).`
      });
    }

    setInsights(newInsights);
  }, [stats, analyses]);

  if (insights.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
      
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg border ${
              insight.type === 'positive' 
                ? 'bg-green-50 border-green-200' 
                : insight.type === 'negative'
                ? 'bg-red-50 border-red-200'
                : insight.type === 'urgent'
                ? 'bg-orange-50 border-orange-200'
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-start">
              <span className="text-2xl mr-3">{insight.icon}</span>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                <p className="text-sm text-gray-700">{insight.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}