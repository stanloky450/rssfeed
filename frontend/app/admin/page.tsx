'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import {
  adminLogin,
  getFeedSources,
  getAdminStats,
  createFeedSource,
  updateFeedSource,
  deleteFeedSource,
  refreshAllFeeds,
  refreshFeed,
} from '@/lib/api';
import { FeedSource, AdminStats } from '@/types';
import { FiPlus, FiRefreshCw, FiTrash2, FiEdit2, FiCheck, FiX, FiLogOut } from 'react-icons/fi';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFeed, setEditingFeed] = useState<FeedSource | null>(null);
  const [newFeed, setNewFeed] = useState({ name: '', url: '', topic: '', description: '' });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch admin data
  const { data: feeds = [], error: feedsError } = useSWR<FeedSource[]>(
    isAuthenticated ? 'admin/feeds' : null,
    getFeedSources
  );

  const { data: stats, error: statsError } = useSWR<AdminStats>(
    isAuthenticated ? 'admin/stats' : null,
    getAdminStats
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const response = await adminLogin(email, password);
      localStorage.setItem('adminToken', response.data.token);
      setIsAuthenticated(true);
    } catch (error: any) {
      setLoginError(error.response?.data?.error || 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
  };

  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createFeedSource(newFeed);
      setShowAddModal(false);
      setNewFeed({ name: '', url: '', topic: '', description: '' });
      mutate('admin/feeds');
    } catch (error) {
      alert('Failed to add feed source');
    }
  };

  const handleUpdateFeed = async (id: string, data: Partial<FeedSource>) => {
    try {
      await updateFeedSource(id, data);
      setEditingFeed(null);
      mutate('admin/feeds');
    } catch (error) {
      alert('Failed to update feed source');
    }
  };

  const handleDeleteFeed = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feed source?')) return;

    try {
      await deleteFeedSource(id);
      mutate('admin/feeds');
    } catch (error) {
      alert('Failed to delete feed source');
    }
  };

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await refreshAllFeeds();
      alert('RSS refresh started! This may take a few minutes.');
      mutate('admin/stats');
    } catch (error) {
      alert('Failed to start refresh');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshSingle = async (id: string) => {
    try {
      await refreshFeed(id);
      alert('Feed refresh started!');
      mutate('admin/feeds');
    } catch (error) {
      alert('Failed to refresh feed');
    }
  };

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Admin Login
          </h2>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="Enter password"
              />
            </div>

            {loginError && (
              <p className="text-red-600 dark:text-red-400 text-sm">{loginError}</p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
            Default credentials: admin@example.com / admin123
          </p>
        </div>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage RSS feed sources and monitor system status
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <FiLogOut />
          Logout
        </button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Articles</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {stats.totalArticles}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Feeds</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {stats.totalFeeds}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Feeds</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
              {stats.activeFeeds}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Recent (24h)</h3>
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 mt-2">
              {stats.recentArticles}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <FiPlus /> Add Feed Source
        </button>
        <button
          onClick={handleRefreshAll}
          disabled={isRefreshing}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          <FiRefreshCw className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Refreshing...' : 'Refresh All Feeds'}
        </button>
      </div>

      {/* Feed Sources Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Topic
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Articles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {feeds.map((feed) => (
                <tr key={feed._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {feed.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                      {feed.url}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded">
                      {feed.topic}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        feed.isActive
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      }`}
                    >
                      {feed.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {feed.articleCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRefreshSingle(feed._id)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        title="Refresh"
                      >
                        <FiRefreshCw />
                      </button>
                      <button
                        onClick={() => handleUpdateFeed(feed._id, { isActive: !feed.isActive })}
                        className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300"
                        title="Toggle Active"
                      >
                        {feed.isActive ? <FiX /> : <FiCheck />}
                      </button>
                      <button
                        onClick={() => handleDeleteFeed(feed._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Feed Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Add Feed Source
            </h3>
            <form onSubmit={handleAddFeed} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={newFeed.name}
                  onChange={(e) => setNewFeed({ ...newFeed, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  RSS URL
                </label>
                <input
                  type="url"
                  value={newFeed.url}
                  onChange={(e) => setNewFeed({ ...newFeed, url: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Topic
                </label>
                <input
                  type="text"
                  value={newFeed.topic}
                  onChange={(e) => setNewFeed({ ...newFeed, topic: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newFeed.description}
                  onChange={(e) => setNewFeed({ ...newFeed, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Add Feed
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
