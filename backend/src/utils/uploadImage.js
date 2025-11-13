import { cloudinary } from '../config/cloudinary.js';
import axios from 'axios';

/**
 * Upload image to Cloudinary from URL
 * @param {string} imageUrl - URL of the image to upload
 * @returns {Promise<string>} - Cloudinary secure URL or original URL if upload fails
 */
export const uploadImageToCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl || typeof imageUrl !== 'string') {
      return null;
    }

    // Validate URL format
    const urlPattern = /^https?:\/\/.+/i;
    if (!urlPattern.test(imageUrl)) {
      console.warn('Invalid image URL format:', imageUrl);
      return imageUrl;
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET) {
      console.warn('Cloudinary not configured, using original image URL');
      return imageUrl;
    }

    // Verify image exists and is accessible
    try {
      const response = await axios.head(imageUrl, { timeout: 5000 });
      const contentType = response.headers['content-type'];

      if (!contentType || !contentType.startsWith('image/')) {
        console.warn('URL does not point to an image:', imageUrl);
        return imageUrl;
      }
    } catch (error) {
      console.warn('Image URL not accessible:', imageUrl);
      return imageUrl;
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'rss_images',
      fetch_format: 'auto',
      quality: 'auto',
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { fetch_format: 'auto', quality: 'auto' }
      ],
      timeout: 60000,
    });

    console.log('✅ Image uploaded to Cloudinary:', result.secure_url);
    return result.secure_url;

  } catch (error) {
    console.error('❌ Cloudinary upload error:', error.message);
    // Return original URL if upload fails
    return imageUrl;
  }
};

/**
 * Extract image URL from RSS item
 * @param {Object} item - RSS feed item
 * @returns {string|null} - Image URL or null
 */
export const extractImageFromRSSItem = (item) => {
  try {
    // Try different possible image sources
    if (item.enclosure && item.enclosure.url) {
      return item.enclosure.url;
    }

    if (item['media:content'] && item['media:content'].$ && item['media:content'].$.url) {
      return item['media:content'].$.url;
    }

    if (item['media:thumbnail'] && item['media:thumbnail'].$ && item['media:thumbnail'].$.url) {
      return item['media:thumbnail'].$.url;
    }

    if (item.image && item.image.url) {
      return item.image.url;
    }

    // Try to extract from content/description
    if (item.content || item.description) {
      const content = item.content || item.description;
      const imgRegex = /<img[^>]+src="([^">]+)"/i;
      const match = content.match(imgRegex);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting image from RSS item:', error.message);
    return null;
  }
};

export default {
  uploadImageToCloudinary,
  extractImageFromRSSItem,
};
