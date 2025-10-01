import { useState } from 'react';
import Papa from 'papaparse';
import { feedbackAPI } from '../../services/api';

export default function UploadCSV({ projectId, onUploadComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file type
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError('');
    setSuccess('');

    // Read file
    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvData = e.target.result;
      await uploadCSV(csvData);
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsText(file);
  };

  const uploadCSV = async (csvData) => {
    try {
      setUploading(true);
      setError('');
      setSuccess('');

      const result = await feedbackAPI.uploadCSV(projectId, csvData);

      setSuccess(`Successfully uploaded ${result.inserted} feedback items`);
      
      if (result.errors && result.errors.length > 0) {
        setError(`Note: ${result.errors.length} items had errors`);
      }

      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete(result);
      }

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload CSV');
      
      // Show helpful hints if available
      if (err.response?.data?.hint) {
        setError(`${err.response.data.error}. ${err.response.data.hint}`);
      }
      if (err.response?.data?.foundColumns) {
        setError(`${err.response.data.error}. Found columns: ${err.response.data.foundColumns.join(', ')}`);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload CSV File</h3>
      
      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="mt-2 text-sm font-medium text-gray-900">
          Drop your CSV file here, or{' '}
          <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
            browse
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </p>
        <p className="mt-1 text-xs text-gray-500">CSV files up to 10MB</p>
      </div>

      {/* CSV Format Info */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">CSV Format Requirements:</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Required column: <code className="bg-blue-100 px-1 py-0.5 rounded">text</code>, <code className="bg-blue-100 px-1 py-0.5 rounded">feedback</code>, <code className="bg-blue-100 px-1 py-0.5 rounded">comment</code>, <code className="bg-blue-100 px-1 py-0.5 rounded">review</code>, or <code className="bg-blue-100 px-1 py-0.5 rounded">message</code></li>
          <li>• Optional: <code className="bg-blue-100 px-1 py-0.5 rounded">customer_name</code>, <code className="bg-blue-100 px-1 py-0.5 rounded">customer_email</code>, <code className="bg-blue-100 px-1 py-0.5 rounded">date_received</code></li>
          <li>• First row should contain column headers</li>
        </ul>
      </div>

      {/* Messages */}
      {uploading && (
        <div className="mt-4 flex items-center justify-center text-blue-600">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-sm">Uploading and processing...</span>
        </div>
      )}

      {success && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-3">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}