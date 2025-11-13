import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Article title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  content: {
    type: String,
    trim: true,
  },
  fullContent: {
    type: String,
    default: '',
  },
  textContent: {
    type: String,
    default: '',
  },
  excerpt: {
    type: String,
    default: '',
  },
  link: {
    type: String,
    required: [true, 'Article link is required'],
    unique: true,
  },
  image: {
    type: String,
    default: null,
  },
  images: [{
    type: String,
  }],
  contentScraped: {
    type: Boolean,
    default: false,
  },
  scrapedAt: {
    type: Date,
    default: null,
  },
  pubDate: {
    type: Date,
    default: Date.now,
  },
  source: {
    type: String,
    required: [true, 'Article source is required'],
  },
  sourceName: {
    type: String,
    default: 'Unknown',
  },
  topic: {
    type: String,
    required: [true, 'Article topic is required'],
    index: true,
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral',
    index: true,
  },
  sentimentScore: {
    type: Number,
    default: 0,
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true,
  }],
  author: {
    type: String,
    trim: true,
  },
  feedSource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeedSource',
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
articleSchema.index({ pubDate: -1 });
articleSchema.index({ createdAt: -1 });
articleSchema.index({ topic: 1, pubDate: -1 });
articleSchema.index({ sentiment: 1, pubDate: -1 });
articleSchema.index({ tags: 1 });

// Text index for search functionality
articleSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Prevent duplicate articles based on link
articleSchema.pre('save', async function(next) {
  if (this.isNew) {
    const exists = await this.constructor.findOne({ link: this.link });
    if (exists) {
      const error = new Error('Article with this link already exists');
      error.code = 11000;
      return next(error);
    }
  }
  next();
});

const Article = mongoose.model('Article', articleSchema);

export default Article;
