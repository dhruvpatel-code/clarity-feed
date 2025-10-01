import { useState } from 'react';

export default function FeedbackTable({ feedback, onDelete, loading }) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (feedbackId) => {
    if (!confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    setDeletingId(feedbackId);
    try {
      await onDelete(feedbackId);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading feedback...</p>
      </div>
    );
  }

  if (feedback.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No feedback yet</h3>
        <p className="mt-1 text-sm text-gray-500">Upload a CSV or add feedback manually to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Feedback Items ({feedback.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Feedback
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {feedback.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-900 line-clamp-2">
                    {item.original_text}
                  </p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    {item.customer_name && (
                      <p className="text-gray-900">{item.customer_name}</p>
                    )}
                    {item.customer_email && (
                      <p className="text-gray-500">{item.customer_email}</p>
                    )}
                    {!item.customer_name && !item.customer_email && (
                      <p className="text-gray-400">—</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    item.source === 'csv'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {item.source}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.date_received
                    ? new Date(item.date_received).toLocaleDateString()
                    : new Date(item.created_at).toLocaleDateString()
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    {deletingId === item.id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}