import axios from 'axios';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import * as cheerio from 'cheerio';

/**
 * Scrape full article content from URL using Mozilla Readability
 * @param {string} url - Article URL to scrape
 * @returns {Promise<Object>} - { content, textContent, excerpt, images }
 */
export const scrapeArticleContent = async (url) => {
  try {
    console.log(`🔍 Scraping content from: ${url}`);

    // Fetch the HTML content
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 15000,
      maxRedirects: 5,
    });

    const html = response.data;

    // Use Mozilla Readability for article extraction
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      console.warn('⚠️  Readability failed to parse article, using fallback');
      return await scrapeArticleContentFallback(html, url);
    }

    // Extract all images from the content
    const images = extractImagesFromHTML(article.content);

    console.log(`✅ Successfully scraped article: ${article.title?.substring(0, 50)}...`);

    return {
      content: article.content || '',
      textContent: article.textContent || '',
      excerpt: article.excerpt || '',
      images: images,
      byline: article.byline || null,
      siteName: article.siteName || null,
      length: article.length || 0,
    };

  } catch (error) {
    console.error(`❌ Error scraping article from ${url}:`, error.message);

    // Return minimal data on error
    return {
      content: '',
      textContent: '',
      excerpt: '',
      images: [],
      error: error.message,
    };
  }
};

/**
 * Fallback scraping method using Cheerio
 * @param {string} html - HTML content
 * @param {string} url - Article URL
 * @returns {Object} - Scraped content
 */
const scrapeArticleContentFallback = (html, url) => {
  try {
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, nav, header, footer, aside, .ad, .advertisement, .social-share').remove();

    // Try to find main content area
    let content = '';
    const contentSelectors = [
      'article',
      '[role="main"]',
      '.article-content',
      '.post-content',
      '.entry-content',
      '.content',
      'main',
    ];

    for (const selector of contentSelectors) {
      const element = $(selector).first();
      if (element.length && element.text().trim().length > 200) {
        content = element.html() || '';
        break;
      }
    }

    // If no content found, get all paragraphs
    if (!content) {
      content = $('p').toArray().map(p => $(p).html()).join('\n');
    }

    // Extract images
    const images = [];
    $('img').each((i, elem) => {
      const src = $(elem).attr('src');
      if (src && !src.includes('pixel') && !src.includes('tracking')) {
        images.push(src.startsWith('http') ? src : new URL(src, url).href);
      }
    });

    const textContent = $(content).text().trim();

    return {
      content: content,
      textContent: textContent,
      excerpt: textContent.substring(0, 300) + '...',
      images: images.slice(0, 10), // Limit to 10 images
    };

  } catch (error) {
    console.error('Fallback scraping error:', error.message);
    return {
      content: '',
      textContent: '',
      excerpt: '',
      images: [],
    };
  }
};

/**
 * Extract all image URLs from HTML content
 * @param {string} html - HTML content
 * @returns {Array<string>} - Array of image URLs
 */
const extractImagesFromHTML = (html) => {
  try {
    const $ = cheerio.load(html);
    const images = [];

    $('img').each((i, elem) => {
      const src = $(elem).attr('src');
      if (src && src.startsWith('http')) {
        // Filter out tracking pixels and small images
        const width = $(elem).attr('width');
        const height = $(elem).attr('height');

        if (!src.includes('pixel') && !src.includes('tracking')) {
          // Skip if dimensions are known and too small
          if (width && height && (parseInt(width) < 100 || parseInt(height) < 100)) {
            return;
          }
          images.push(src);
        }
      }
    });

    return images.slice(0, 20); // Limit to 20 images
  } catch (error) {
    console.error('Error extracting images:', error.message);
    return [];
  }
};

/**
 * Clean and sanitize HTML content
 * @param {string} html - HTML content
 * @returns {string} - Cleaned HTML
 */
export const sanitizeHTML = (html) => {
  if (!html) return '';

  try {
    const $ = cheerio.load(html);

    // Remove dangerous elements
    $('script, iframe, embed, object').remove();

    // Remove event handlers
    $('*').each((i, elem) => {
      const attributes = Object.keys(elem.attribs || {});
      attributes.forEach(attr => {
        if (attr.startsWith('on')) {
          $(elem).removeAttr(attr);
        }
      });
    });

    // Keep only safe attributes
    const safeAttrs = ['src', 'href', 'alt', 'title', 'class', 'id', 'width', 'height'];
    $('*').each((i, elem) => {
      const attributes = Object.keys(elem.attribs || {});
      attributes.forEach(attr => {
        if (!safeAttrs.includes(attr)) {
          $(elem).removeAttr(attr);
        }
      });
    });

    return $.html();
  } catch (error) {
    console.error('Error sanitizing HTML:', error.message);
    return '';
  }
};

/**
 * Extract metadata from article URL
 * @param {string} url - Article URL
 * @returns {Promise<Object>} - Metadata (title, description, image, etc.)
 */
export const extractMetadata = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);

    // Extract Open Graph and meta tags
    const metadata = {
      title: $('meta[property="og:title"]').attr('content') || $('title').text(),
      description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content'),
      image: $('meta[property="og:image"]').attr('content'),
      siteName: $('meta[property="og:site_name"]').attr('content'),
      author: $('meta[name="author"]').attr('content') || $('meta[property="article:author"]').attr('content'),
      publishedTime: $('meta[property="article:published_time"]').attr('content'),
      keywords: $('meta[name="keywords"]').attr('content'),
    };

    return metadata;
  } catch (error) {
    console.error('Error extracting metadata:', error.message);
    return {};
  }
};

export default {
  scrapeArticleContent,
  sanitizeHTML,
  extractMetadata,
};
