'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { TopicCount } from '@/types';

interface FilterBarProps {
  topics: TopicCount[];
  selectedTopic: string;
  selectedSentiment: string;
  searchQuery: string;
  onTopicChange: (topic: string) => void;
  onSentimentChange: (sentiment: string) => void;
  onSearchChange: (query: string) => void;
}

export function FilterBar({
  topics,
  selectedTopic,
  selectedSentiment,
  searchQuery,
  onTopicChange,
  onSentimentChange,
  onSearchChange,
}: FilterBarProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  const sentiments = [
    { value: '', label: 'All Sentiments' },
    { value: 'positive', label: 'Positive' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'negative', label: 'Negative' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search
          </label>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiX />
              </button>
            )}
          </div>
        </div>

        {/* Topic Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Topic
          </label>
          <select
            value={selectedTopic}
            onChange={(e) => onTopicChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Topics</option>
            {topics.map((topic) => (
              <option key={topic.topic} value={topic.topic}>
                {topic.topic} ({topic.count})
              </option>
            ))}
          </select>
        </div>

        {/* Sentiment Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sentiment
          </label>
          <select
            value={selectedSentiment}
            onChange={(e) => onSentimentChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {sentiments.map((sentiment) => (
              <option key={sentiment.value} value={sentiment.value}>
                {sentiment.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters */}
      {(selectedTopic || selectedSentiment || searchQuery) && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
          {selectedTopic && (
            <button
              onClick={() => onTopicChange('')}
              className="flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded-full text-sm hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
            >
              Topic: {selectedTopic}
              <FiX className="w-3 h-3" />
            </button>
          )}
          {selectedSentiment && (
            <button
              onClick={() => onSentimentChange('')}
              className="flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded-full text-sm hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
            >
              Sentiment: {selectedSentiment}
              <FiX className="w-3 h-3" />
            </button>
          )}
          {searchQuery && (
            <button
              onClick={() => {
                setLocalSearch('');
                onSearchChange('');
              }}
              className="flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded-full text-sm hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
            >
              Search: {searchQuery}
              <FiX className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
