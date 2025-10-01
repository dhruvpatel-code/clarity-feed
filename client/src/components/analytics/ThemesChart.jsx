import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';

export default function ThemesChart({ analyses }) {
  const [themeData, setThemeData] = useState([]);

  useEffect(() => {
    if (!analyses || analyses.length === 0) return;

    // Aggregate themes
    const themeCounts = {};
    analyses.forEach(analysis => {
      if (analysis.themes && Array.isArray(analysis.themes)) {
        analysis.themes.forEach(theme => {
          themeCounts[theme] = (themeCounts[theme] || 0) + 1;
        });
      }
    });

    // Convert to array and sort
    const sortedThemes = Object.entries(themeCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 themes

    setThemeData(sortedThemes);
  }, [analyses]);

  if (themeData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Top Themes</h3>
        <p className="text-sm text-gray-500">No themes data available yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Top Themes</h3>
      <p className="text-sm text-gray-500 mb-4">Most frequently mentioned topics in feedback</p>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={themeData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-900">{payload[0].payload.name}</p>
                    <p className="text-sm text-gray-600">
                      Mentioned {payload[0].value} times
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}