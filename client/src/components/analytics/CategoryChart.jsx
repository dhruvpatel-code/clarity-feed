import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useEffect, useState } from 'react';

const CATEGORY_COLORS = {
  product: '#3b82f6',
  service: '#10b981',
  pricing: '#f59e0b',
  support: '#8b5cf6',
  delivery: '#ef4444',
  other: '#6b7280'
};

export default function CategoryChart({ analyses }) {
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    if (!analyses || analyses.length === 0) return;

    // Count categories
    const categoryCounts = {};
    analyses.forEach(analysis => {
      const category = analysis.category || 'other';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    // Convert to array and sort
    const sorted = Object.entries(categoryCounts)
      .map(([name, count]) => ({ 
        name: name.charAt(0).toUpperCase() + name.slice(1), 
        count,
        color: CATEGORY_COLORS[name.toLowerCase()] || CATEGORY_COLORS.other
      }))
      .sort((a, b) => b.count - a.count);

    setCategoryData(sorted);
  }, [analyses]);

  if (categoryData.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Feedback Categories</h3>
      <p className="text-sm text-gray-500 mb-4">Distribution of feedback by category</p>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={categoryData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-900">{payload[0].payload.name}</p>
                    <p className="text-sm text-gray-600">
                      {payload[0].value} items
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
        {categoryData.map((item) => (
          <div key={item.name} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="text-sm text-gray-700">
              {item.name}: {item.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}