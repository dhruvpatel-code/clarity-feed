import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import SentimentChart from '../components/analytics/SentimentChart';
import ThemesChart from '../components/analytics/ThemesChart';
import CategoryChart from '../components/analytics/CategoryChart';
import UrgencyOverview from '../components/analytics/UrgencyOverview';
import KeyInsights from '../components/analytics/KeyInsights';
import ExecutiveSummary from '../components/analytics/ExecutiveSummary';
import { projectsAPI, analysisAPI } from '../services/api';

export default function Analytics() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [stats, setStats] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch project details
      const projectData = await projectsAPI.getById(id);
      setProject(projectData.project);
      
      // Fetch analyses
      const analysisData = await analysisAPI.getAllAnalyses(id);
      setStats(analysisData.stats);
      setAnalyses(analysisData.analyses);
      
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <DashboardLayout>
        <div className="px-4 sm:px-0">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Link to="/projects" className="hover:text-gray-700">Projects</Link>
            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link to={`/projects/${id}`} className="hover:text-gray-700">{project?.name}</Link>
            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900">Analytics</span>
          </div>

          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No analytics available</h3>
            <p className="mt-1 text-sm text-gray-500">Analyze some feedback first to see insights</p>
            <div className="mt-6">
              <Link
                to={`/projects/${id}`}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Go to Project
              </Link>
            </div>
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
          <Link to={`/projects/${id}`} className="hover:text-gray-700">{project?.name}</Link>
          <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900">Analytics</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{project?.name} - Analytics</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive insights from {stats.total} analyzed feedback items
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Total Analyzed</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Avg Sentiment</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.avgSentimentScore.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.avgSentimentScore > 0 ? '😊 Positive' : stats.avgSentimentScore < 0 ? '😞 Negative' : '😐 Neutral'}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Critical Issues</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{stats.urgency.critical}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">High Priority</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">{stats.urgency.high}</p>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mb-8">
          <ExecutiveSummary projectId={id} />
        </div>

        {/* Key Insights */}
        <div className="mb-8">
          <KeyInsights stats={stats} analyses={analyses} />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <SentimentChart stats={stats} />
          <CategoryChart analyses={analyses} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ThemesChart analyses={analyses} />
          <UrgencyOverview analyses={analyses} />
        </div>
      </div>
    </DashboardLayout>
  );
}