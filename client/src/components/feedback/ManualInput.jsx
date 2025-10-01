import { useState } from 'react';
import { feedbackAPI } from '../../services/api';

export default function ManualInput({ projectId, onFeedbackAdded }) {
  const [formData, setFormData] = useState({
    text: '',
    customerName: '',
    customerEmail: '',
    dateReceived: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.text.trim()) {
      setError('Feedback text is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const result = await feedbackAPI.create(
        projectId,
        formData.text,
        formData.customerName || null,
        formData.customerEmail || null,
        formData.dateReceived || null
      );

      setSuccess('Feedback added successfully!');
      
      // Reset form
      setFormData({
        text: '',
        customerName: '',
        customerEmail: '',
        dateReceived: '',
      });

      // Notify parent
      if (onFeedbackAdded) {
        onFeedbackAdded(result.feedback);
      }

    } catch (err) {
      console.error('Add feedback error:', err);
      setError(err.response?.data?.error || 'Failed to add feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Feedback Manually</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Feedback Text */}
        <div>
          <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
            Feedback Text *
          </label>
          <textarea
            id="text"
            name="text"
            value={formData.text}
            onChange={handleChange}
            rows={4}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter customer feedback..."
            required
            maxLength={10000}
          />
          <p className="mt-1 text-xs text-gray-500">
            {formData.text.length} / 10,000 characters
          </p>
        </div>

        {/* Optional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name (optional)
            </label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Customer Email (optional)
            </label>
            <input
              type="email"
              id="customerEmail"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="dateReceived" className="block text-sm font-medium text-gray-700 mb-1">
            Date Received (optional)
          </label>
          <input
            type="date"
            id="dateReceived"
            name="dateReceived"
            value={formData.dateReceived}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Adding...' : 'Add Feedback'}
        </button>
      </form>
    </div>
  );
}