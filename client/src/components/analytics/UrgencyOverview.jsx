export default function UrgencyOverview({ analyses }) {
  if (!analyses || analyses.length === 0) return null;

  // Count urgency levels
  const urgencyCounts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  };

  analyses.forEach(analysis => {
    const urgency = analysis.urgency?.toLowerCase() || 'low';
    if (urgencyCounts.hasOwnProperty(urgency)) {
      urgencyCounts[urgency]++;
    }
  });

  // Get critical and high urgency items
  const urgentItems = analyses
    .filter(a => a.urgency === 'critical' || a.urgency === 'high')
    .slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Urgency Overview</h3>
      
      {/* Urgency Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <p className="text-sm font-medium text-red-600">Critical</p>
          <p className="text-2xl font-bold text-red-900 mt-1">{urgencyCounts.critical}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <p className="text-sm font-medium text-orange-600">High</p>
          <p className="text-2xl font-bold text-orange-900 mt-1">{urgencyCounts.high}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <p className="text-sm font-medium text-yellow-600">Medium</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">{urgencyCounts.medium}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm font-medium text-green-600">Low</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{urgencyCounts.low}</p>
        </div>
      </div>

      {/* Urgent Items List */}
      {urgentItems.length > 0 && (
        <>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Requires Immediate Attention
          </h4>
          <div className="space-y-3">
            {urgentItems.map((item, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${
                  item.urgency === 'critical' 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-orange-50 border-orange-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 line-clamp-2">
                      {item.original_text}
                    </p>
                    {item.key_points && item.key_points.length > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        • {item.key_points[0]}
                      </p>
                    )}
                  </div>
                  <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${
                    item.urgency === 'critical'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {item.urgency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}