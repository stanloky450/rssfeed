'use client';

import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import Image from 'next/image';
import Link from 'next/link';
import { getArticleById } from '@/lib/api';
import { Article } from '@/types';
import { formatDate, formatRelativeTime, getSentimentColor, getSentimentBgColor } from '@/lib/utils';
import { FiArrowLeft, FiExternalLink, FiCalendar, FiUser, FiSmile, FiMeh, FiFrown, FiTag } from 'react-icons/fi';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: article, error, isLoading } = useSWR<Article>(
    id ? `article/${id}` : null,
    () => getArticleById(id)
  );

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <FiSmile className="w-5 h-5" />;
      case 'negative':
        return <FiFrown className="w-5 h-5" />;
      default:
        return <FiMeh className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Article Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The article you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          <FiArrowLeft />
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <FiArrowLeft />
          Back
        </button>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Header */}
        <header className="mb-8">
          {/* Topic Badge */}
          <div className="mb-4">
            <span className="inline-block px-3 py-1 text-sm font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded-full">
              {article.topic}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400 mb-6">
            {article.author && (
              <div className="flex items-center gap-2">
                <FiUser className="w-4 h-4" />
                <span>{article.author}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <FiCalendar className="w-4 h-4" />
              <span>{formatDate(article.pubDate)}</span>
              <span className="text-sm">({formatRelativeTime(article.pubDate)})</span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${getSentimentBgColor(article.sentiment)} ${getSentimentColor(article.sentiment)}`}>
              {getSentimentIcon(article.sentiment)}
              <span className="capitalize">{article.sentiment}</span>
            </div>
          </div>

          {/* Source Info */}
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Source</p>
              <p className="font-medium text-gray-900 dark:text-white">{article.sourceName}</p>
            </div>
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              View Original
              <FiExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Featured Image */}
          {article.image && (
            <div className="relative w-full h-96 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden mb-8">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <FiTag className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-1" />
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Article Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-12">
          {article.contentScraped && article.fullContent ? (
            <>
              {/* Scraped Content Badge */}
              <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-300">
                  ✓ Full article content extracted and displayed below
                </p>
              </div>

              {/* Full Article Content */}
              <div
                className="prose prose-lg dark:prose-invert max-w-none
                  prose-headings:text-gray-900 dark:prose-headings:text-white
                  prose-p:text-gray-700 dark:prose-p:text-gray-300
                  prose-a:text-primary-600 dark:prose-a:text-primary-400
                  prose-strong:text-gray-900 dark:prose-strong:text-white
                  prose-img:rounded-lg prose-img:shadow-md
                  prose-blockquote:border-primary-500 dark:prose-blockquote:border-primary-400
                  prose-code:text-primary-600 dark:prose-code:text-primary-400"
                dangerouslySetInnerHTML={{ __html: article.fullContent }}
              />

              {/* Additional Images Gallery */}
              {article.images && article.images.length > 1 && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Images from Article
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {article.images.slice(0, 9).map((img, index) => (
                      <div key={index} className="relative h-48 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <Image
                          src={img}
                          alt={`Article image ${index + 1}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* RSS Content Only */}
              <div className="mb-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  ⚠️ Only RSS feed content available. Click "View Original" above to read the full article.
                </p>
              </div>

              {/* Description/Excerpt */}
              {article.excerpt || article.description ? (
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {article.excerpt || article.description}
                  </p>
                </div>
              ) : null}

              {/* RSS Content if available */}
              {article.content && (
                <div
                  className="mt-6 prose prose-lg dark:prose-invert max-w-none
                    prose-p:text-gray-700 dark:prose-p:text-gray-300"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              )}

              {/* CTA to original article */}
              <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Continue reading the full article on the original site
                </p>
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
                >
                  Read Full Article
                  <FiExternalLink />
                </a>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Published on {formatDate(article.pubDate)}
            </p>
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              <FiArrowLeft />
              Back to Feed
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
