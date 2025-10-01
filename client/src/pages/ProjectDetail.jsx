import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import UploadCSV from '../components/feedback/UploadCSV';
import ManualInput from '../components/feedback/ManualInput';
import FeedbackTable from '../components/feedback/FeedbackTable';
import { projectsAPI, feedbackAPI } from '../services/api';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('table'); // 'table', 'upload', 'manual'

  useEffect(() => {
    fetchProject();
    fetchFeedback();
    fetchStats();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await projectsAPI.getById(id);
      setProject(data.project);
    } catch (error) {
      console.error('Failed to fetch project:', error);
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async () => {
    try {
      setFeedbackLoading(true);
      const data = await feedbackAPI.getAll(id);
      setFeedback(data.feedback);
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await projectsAPI.getStats(id);
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      await projectsAPI.delete(id);
      navigate('/projects');
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project');
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    try {
      await feedbackAPI.delete(id, feedbackId);
      setFeedback(feedback.filter(f => f.id !== feedbackId));
      fetchStats(); // Update stats
    } catch (error) {
      console.error('Failed to delete feedback:', error);
      alert('Failed to delete feedback');
    }
  };

  const handleUploadComplete = (result) => {
    fetchFeedback();
    fetchStats();
    setActiveTab('table');
  };

  const handleFeedbackAdded = (newFeedback) => {
    setFeedback([newFeedback, ...feedback]);
    fetchStats();
    setActiveTab('table');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !project) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Project not found</h3>
          <p className="mt-1 text-sm text-gray-500">The project you're looking for doesn't exist</p>
          <div className="mt-6">
            <Link
              to="/projects"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Back to Projects
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-0">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Link to="/projects" className="hover:text-gray-700">Projects</Link>
          <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900">{project.name}</span>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            {project.description && (
              <p className="mt-2 text-gray-600">{project.description}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Created on {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={handleDelete}
            className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors text-sm font-medium"
          >
            Delete Project
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600">Total Feedback</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalFeedback}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600">Analyzed</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.analyzed}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600">Pending</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('table')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'table'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Feedback ({feedback.length})
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Upload CSV
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'manual'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Add Manually
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'table' && (
          <FeedbackTable
            feedback={feedback}
            onDelete={handleDeleteFeedback}
            loading={feedbackLoading}
          />
        )}

        {activeTab === 'upload' && (
          <UploadCSV
            projectId={id}
            onUploadComplete={handleUploadComplete}
          />
        )}

        {activeTab === 'manual' && (
          <ManualInput
            projectId={id}
            onFeedbackAdded={handleFeedbackAdded}
          />
        )}
      </div>
    </DashboardLayout>
  );
}