import mongoose from 'mongoose';

const feedSourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Feed source name is required'],
    trim: true,
  },
  url: {
    type: String,
    required: [true, 'Feed URL is required'],
    unique: true,
    trim: true,
  },
  topic: {
    type: String,
    required: [true, 'Feed topic is required'],
    trim: true,
    index: true,
  },
  description: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastFetchedAt: {
    type: Date,
    default: null,
  },
  fetchStatus: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'pending',
  },
  fetchError: {
    type: String,
    default: null,
  },
  articleCount: {
    type: Number,
    default: 0,
  },
  metadata: {
    feedTitle: String,
    feedDescription: String,
    feedLink: String,
    feedImage: String,
  },
}, {
  timestamps: true,
});

// Indexes
feedSourceSchema.index({ topic: 1, isActive: 1 });
feedSourceSchema.index({ lastFetchedAt: -1 });

// Instance method to update fetch status
feedSourceSchema.methods.updateFetchStatus = async function(status, error = null) {
  this.fetchStatus = status;
  this.lastFetchedAt = new Date();
  if (error) {
    this.fetchError = error;
  } else {
    this.fetchError = null;
  }
  await this.save();
};

const FeedSource = mongoose.model('FeedSource', feedSourceSchema);

export default FeedSource;
