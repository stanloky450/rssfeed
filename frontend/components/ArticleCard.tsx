'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Article } from '@/types';
import { formatRelativeTime, getSentimentColor, getSentimentBgColor } from '@/lib/utils';
import { FiExternalLink, FiSmile, FiMeh, FiFrown } from 'react-icons/fi';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <FiSmile className="w-4 h-4" />;
      case 'negative':
        return <FiFrown className="w-4 h-4" />;
      default:
        return <FiMeh className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {article.image && (
        <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <span className="inline-block px-2 py-1 text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded">
              {article.topic}
            </span>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${getSentimentBgColor(article.sentiment)} ${getSentimentColor(article.sentiment)}`}>
            {getSentimentIcon(article.sentiment)}
            <span className="capitalize">{article.sentiment}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {article.title}
        </h3>

        {/* Description */}
        {article.description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
            {article.description}
          </p>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.slice(0, 4).map((tag, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {article.sourceName}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {formatRelativeTime(article.pubDate)}
            </span>
          </div>

          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            Read More
            <FiExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
