'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import useSWR from 'swr';
import { getArticles, getTopics } from '@/lib/api';
import { Article, TopicCount } from '@/types';
import { ArticleCard } from '@/components/ArticleCard';
import { FilterBar } from '@/components/FilterBar';
import { LoadingSpinner, ArticleCardSkeleton } from '@/components/LoadingSpinner';
import { FiAlertCircle } from 'react-icons/fi';

export default function Home() {
  const [page, setPage] = useState(1);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedSentiment, setSelectedSentiment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch topics
  const { data: topics = [] } = useSWR<TopicCount[]>('topics', getTopics);

  // Fetch articles
  const { data, error, isLoading } = useSWR(
    ['articles', page, selectedTopic, selectedSentiment, searchQuery],
    () =>
      getArticles({
        page,
        limit: 12,
        topic: selectedTopic || undefined,
        sentiment: selectedSentiment || undefined,
        search: searchQuery || undefined,
      }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  // Update articles when data changes
  useEffect(() => {
    if (data?.data) {
      if (page === 1) {
        setAllArticles(data.data.articles);
      } else {
        setAllArticles((prev) => [...prev, ...data.data.articles]);
      }
      setHasMore(data.data.pagination.hasMore);
    }
  }, [data, page]);

  // Reset when filters change
  useEffect(() => {
    setPage(1);
    setAllArticles([]);
  }, [selectedTopic, selectedSentiment, searchQuery]);

  // Infinite scroll observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !isLoading) {
        setPage((prev) => prev + 1);
      }
    },
    [hasMore, isLoading]
  );

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const option = {
      root: null,
      rootMargin: '200px',
      threshold: 0,
    };

    const observer = new IntersectionObserver(handleObserver, option);
    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [handleObserver]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Latest Articles
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover the latest news and articles from various sources, powered by AI sentiment analysis
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar
        topics={topics}
        selectedTopic={selectedTopic}
        selectedSentiment={selectedSentiment}
        searchQuery={searchQuery}
        onTopicChange={setSelectedTopic}
        onSentimentChange={setSelectedSentiment}
        onSearchChange={setSearchQuery}
      />

      {/* Stats Banner */}
      {data?.cached && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2">
            <FiAlertCircle />
            Results served from cache for faster performance
          </p>
        </div>
      )}

      {/* Articles Grid */}
      {isLoading && page === 1 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400">
            Failed to load articles. Please try again later.
          </p>
        </div>
      ) : allArticles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No articles found. Try adjusting your filters.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allArticles.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>

          {/* Loading more indicator */}
          <div ref={observerTarget} className="mt-8">
            {isLoading && page > 1 && <LoadingSpinner />}
            {!hasMore && allArticles.length > 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                You've reached the end of the feed
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
