import Sentiment from 'sentiment';
import natural from 'natural';

const sentimentAnalyzer = new Sentiment();
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

/**
 * Analyze the sentiment of text and return sentiment label and score
 * @param {string} text - Text to analyze
 * @returns {Object} - { sentiment: 'positive' | 'neutral' | 'negative', score: number }
 */
export const analyzeSentiment = (text) => {
  try {
    if (!text || typeof text !== 'string') {
      return { sentiment: 'neutral', score: 0 };
    }

    const result = sentimentAnalyzer.analyze(text);
    const score = result.score;

    let sentimentLabel;
    if (score > 2) {
      sentimentLabel = 'positive';
    } else if (score < -2) {
      sentimentLabel = 'negative';
    } else {
      sentimentLabel = 'neutral';
    }

    return {
      sentiment: sentimentLabel,
      score: score,
      comparative: result.comparative,
    };
  } catch (error) {
    console.error('Error analyzing sentiment:', error.message);
    return { sentiment: 'neutral', score: 0 };
  }
};

/**
 * Extract keywords/tags from text using TF-IDF and basic NLP
 * @param {string} text - Text to extract keywords from
 * @param {number} maxTags - Maximum number of tags to return
 * @returns {Array<string>} - Array of extracted keywords
 */
export const extractKeywords = (text, maxTags = 10) => {
  try {
    if (!text || typeof text !== 'string') {
      return [];
    }

    // Tokenize and filter
    const tokens = tokenizer.tokenize(text.toLowerCase());

    // Remove stop words and short words
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
      'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'when',
      'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
      'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
      'than', 'too', 'very', 's', 't', 'just', 'now', 'said', 'says', 'about',
    ]);

    const filteredTokens = tokens.filter(token =>
      token.length > 3 &&
      !stopWords.has(token) &&
      /^[a-z]+$/.test(token)
    );

    // Count frequency
    const frequency = {};
    filteredTokens.forEach(token => {
      frequency[token] = (frequency[token] || 0) + 1;
    });

    // Sort by frequency and get top keywords
    const sortedKeywords = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxTags)
      .map(([keyword]) => keyword);

    return sortedKeywords;
  } catch (error) {
    console.error('Error extracting keywords:', error.message);
    return [];
  }
};

/**
 * Analyze article content and extract both sentiment and keywords
 * @param {Object} article - Article object with title and description
 * @returns {Object} - { sentiment, score, tags }
 */
export const analyzeArticle = (article) => {
  try {
    const textToAnalyze = `${article.title || ''} ${article.description || ''} ${article.content || ''}`;

    const sentimentResult = analyzeSentiment(textToAnalyze);
    const keywords = extractKeywords(textToAnalyze, 8);

    return {
      sentiment: sentimentResult.sentiment,
      sentimentScore: sentimentResult.score,
      tags: keywords,
    };
  } catch (error) {
    console.error('Error analyzing article:', error.message);
    return {
      sentiment: 'neutral',
      sentimentScore: 0,
      tags: [],
    };
  }
};

export default {
  analyzeSentiment,
  extractKeywords,
  analyzeArticle,
};
