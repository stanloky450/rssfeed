# 📰 Full-Stack RSS Feed Aggregator

A modern, full-featured RSS Feed Aggregator with AI-powered sentiment analysis, keyword tagging, Redis caching, and a beautiful admin panel.

## 🚀 Features

### Backend
- **RSS Parsing & Aggregation** - Fetch and parse multiple RSS feeds automatically
- **Full Content Scraping** - Automatically extract complete article content from source URLs
- **AI-Powered Analysis** - Sentiment analysis and keyword extraction using NLP
- **Redis Caching** - Fast response times with intelligent caching
- **Image Optimization** - Cloudinary integration for optimized image delivery
- **Multi-Image Support** - Extract and store all images from articles
- **Content Sanitization** - Safe HTML rendering with XSS protection
- **Admin API** - Comprehensive REST API for feed management
- **Automated Refresh** - Scheduled RSS feed updates with node-cron
- **MongoDB Storage** - Efficient data storage with Mongoose ODM

### Frontend
- **Next.js 14** - Modern React framework with App Router
- **Internal Article Viewer** - Read full articles without leaving the site
- **Rich Content Display** - Beautiful typography and image galleries
- **Dark Mode** - Beautiful dark/light theme switching
- **Infinite Scrolling** - Seamless content loading as you scroll
- **Advanced Filtering** - Filter by topic, sentiment, search keywords
- **Real-time Updates** - SWR for optimistic UI updates
- **Responsive Design** - Looks great on all devices
- **Admin Dashboard** - Manage feeds, view stats, trigger refreshes

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Redis for caching
- RSS Parser
- Web scraping with Mozilla Readability, Cheerio, and JSDOM
- Sentiment analysis with `sentiment` library
- Natural language processing with `natural`
- Cloudinary for image handling
- Node-cron for scheduling
- JWT authentication

### Frontend
- Next.js 14 with TypeScript
- React 18
- Tailwind CSS
- SWR for data fetching
- next-themes for dark mode
- React Icons
- date-fns for date formatting

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **MongoDB** (v4.4 or higher)
- **Redis** (v6 or higher)
- **npm** or **yarn**

Optional:
- **Cloudinary account** (for image optimization)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd rssfeed
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/rss-aggregator

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
CACHE_EXPIRY=3600

# Cloudinary Configuration (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_secret

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Admin Credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

# RSS Refresh Interval (cron format: every hour)
RSS_REFRESH_CRON=0 * * * *
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Start MongoDB

```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Linux (with systemd)
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 5. Start Redis

```bash
# macOS (with Homebrew)
brew services start redis

# Linux
sudo systemctl start redis

# Windows (with Redis for Windows)
redis-server
```

### 6. Start the Backend Server

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:5000`

### 7. Start the Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000`

## 📝 Usage

### Adding RSS Feeds

1. Navigate to `http://localhost:3000/admin`
2. Login with default credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
3. Click "Add Feed Source"
4. Enter feed details:
   - **Name**: Display name for the feed
   - **RSS URL**: Full URL to the RSS feed
   - **Topic**: Category (e.g., Tech, News, Sports)
   - **Description**: Optional description

### Popular RSS Feeds to Try

```
TechCrunch
- URL: https://techcrunch.com/feed/
- Topic: Technology

Hacker News
- URL: https://news.ycombinator.com/rss
- Topic: Technology

The Verge
- URL: https://www.theverge.com/rss/index.xml
- Topic: Technology

BBC News
- URL: http://feeds.bbci.co.uk/news/rss.xml
- Topic: News

CNN Top Stories
- URL: http://rss.cnn.com/rss/cnn_topstories.rss
- Topic: News
```

### Viewing Articles

1. Go to `http://localhost:3000`
2. Browse articles in a beautiful card grid
3. Filter by:
   - **Topic** - Select specific categories
   - **Sentiment** - Positive, Neutral, or Negative
   - **Search** - Find articles by keywords
4. Click "Read More" to view the full article

### Admin Features

- **Dashboard Stats** - View total articles, feeds, and recent activity
- **Feed Management** - Add, edit, activate/deactivate, or delete feeds
- **Manual Refresh** - Trigger RSS feed updates on-demand
- **Status Monitoring** - See which feeds are active and their article count

## 🏗️ Project Structure

```
rssfeed/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, Redis, Cloudinary config
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic (RSS, sentiment, cache)
│   │   ├── utils/           # Utilities (image upload, scheduler)
│   │   ├── middleware/      # Auth middleware
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server entry point
│   ├── .env                 # Environment variables
│   └── package.json
│
└── frontend/
    ├── app/                 # Next.js App Router
    │   ├── admin/          # Admin panel
    │   ├── layout.tsx      # Root layout
    │   ├── page.tsx        # Home page
    │   └── globals.css     # Global styles
    ├── components/          # React components
    ├── lib/                # API client, utilities
    ├── types/              # TypeScript types
    ├── .env.local          # Environment variables
    └── package.json
```

## 🔌 API Endpoints

### Public Endpoints

```
GET  /api/articles          - Get paginated articles with filters
GET  /api/articles/:id      - Get single article
GET  /api/articles/trending - Get trending articles
GET  /api/topics            - Get all topics with counts
GET  /api/tags              - Get popular tags
GET  /api/articles/stats    - Get article statistics
```

### Admin Endpoints (Protected)

```
POST /api/admin/login              - Admin authentication
GET  /api/admin/me                 - Get admin profile
GET  /api/admin/stats              - Get admin dashboard stats
GET  /api/admin/feeds              - Get all feed sources
POST /api/admin/feeds              - Create new feed source
GET  /api/admin/feeds/:id          - Get single feed source
PUT  /api/admin/feeds/:id          - Update feed source
DELETE /api/admin/feeds/:id        - Delete feed source
POST /api/admin/refresh            - Refresh all feeds
POST /api/admin/feeds/:id/refresh  - Refresh single feed
```

## 🎨 Customization

### Changing the Theme Colors

Edit `frontend/tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom colors here
      },
    },
  },
}
```

### Adjusting RSS Refresh Interval

Change the cron expression in `backend/.env`:

```env
# Every hour
RSS_REFRESH_CRON=0 * * * *

# Every 30 minutes
RSS_REFRESH_CRON=*/30 * * * *

# Every day at midnight
RSS_REFRESH_CRON=0 0 * * *
```

### Modifying Sentiment Analysis

Edit sentiment thresholds in `backend/src/services/sentimentService.js`:

```javascript
if (score > 2) {
  sentimentLabel = 'positive';
} else if (score < -2) {
  sentimentLabel = 'negative';
}
```

## 🐛 Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
mongosh

# Restart MongoDB
brew services restart mongodb-community  # macOS
sudo systemctl restart mongod            # Linux
```

### Redis Connection Issues

```bash
# Check if Redis is running
redis-cli ping

# Should return: PONG

# Restart Redis
brew services restart redis    # macOS
sudo systemctl restart redis   # Linux
```

### Port Already in Use

```bash
# Kill process on port 5000 (backend)
npx kill-port 5000

# Kill process on port 3000 (frontend)
npx kill-port 3000
```

### Cloudinary Images Not Loading

If you don't have Cloudinary set up, images will use the original RSS feed URLs. To enable Cloudinary:

1. Create a free account at https://cloudinary.com
2. Get your credentials from the dashboard
3. Add them to `backend/.env`

## 🚀 Production Deployment

### Backend (Example: Heroku)

1. Create a new Heroku app
2. Add MongoDB addon (mLab or MongoDB Atlas)
3. Add Redis addon (Redis Cloud or Heroku Redis)
4. Set environment variables
5. Deploy:

```bash
cd backend
git push heroku main
```

### Frontend (Example: Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js, Express, MongoDB, and Redis
