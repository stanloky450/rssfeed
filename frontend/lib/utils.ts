import { formatDistanceToNow, format } from 'date-fns';

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
}

export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function getSentimentColor(sentiment: string): string {
  switch (sentiment) {
    case 'positive':
      return 'text-green-600 dark:text-green-400';
    case 'negative':
      return 'text-red-600 dark:text-red-400';
    case 'neutral':
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}

export function getSentimentBgColor(sentiment: string): string {
  switch (sentiment) {
    case 'positive':
      return 'bg-green-100 dark:bg-green-900/30';
    case 'negative':
      return 'bg-red-100 dark:bg-red-900/30';
    case 'neutral':
    default:
      return 'bg-gray-100 dark:bg-gray-800';
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
