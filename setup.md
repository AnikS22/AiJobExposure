# 🚀 AI Job Doom Meter - Complete Setup Guide

## ✅ Current Status
- ✅ Next.js 15.5.3 with Turbopack
- ✅ Development server running on http://localhost:3001
- ✅ All dependencies installed
- ✅ Build process working
- ✅ Search-informed AI analysis implemented

## 🔑 Environment Setup

### 1. OpenAI API Key Setup
You need to set up your OpenAI API key in the `.env.local` file:

```bash
# Edit the .env.local file
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

**To get your OpenAI API key:**
1. Go to https://platform.openai.com/api-keys
2. Sign in to your OpenAI account
3. Click "Create new secret key"
4. Copy the key and replace `your_openai_api_key_here` in `.env.local`

### 2. Test the Application
1. Open http://localhost:3001 in your browser
2. Enter a job title (e.g., "Software Engineer", "Teacher", "Lawyer")
3. Click "Analyze My Job"
4. The app will:
   - Search multiple sources for real research data
   - Use that data to inform AI analysis
   - Provide evidence-based vulnerability score

## 🌐 Deployment to Vercel

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy to Vercel
1. Go to https://vercel.com
2. Import your GitHub repository
3. Add environment variable:
   - Key: `OPENAI_API_KEY`
   - Value: Your actual OpenAI API key
4. Deploy!

## 🎯 Features

### Core Functionality
- **Multi-Engine Search**: Searches DuckDuckGo, Brave, Bing, Google Scholar, and specialized sources
- **Search-Informed AI**: AI analysis is based on real research data
- **Evidence-Based Scoring**: Vulnerability scores backed by actual studies
- **Comprehensive Results**: Score, rationale, upskilling, alternatives, and humor

### UI Features
- **Responsive Design**: Works on all devices
- **Loading States**: Engaging loading animations
- **Color-Coded Scores**: Visual indicators for vulnerability levels
- **Source Links**: Real research sources with relevance scores
- **Error Handling**: Graceful error messages

### Technical Features
- **Server-Side API Keys**: Secure OpenAI integration
- **Parallel Processing**: Fast search across multiple engines
- **Content Extraction**: Extracts full article content for analysis
- **Relevance Scoring**: Ranks results by credibility and relevance
- **Fault Tolerance**: Continues working even if some sources fail

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 📁 Project Structure

```
/app
├── page.tsx              # Main UI component
├── layout.tsx            # App layout with metadata
├── globals.css           # Global styles
└── api/
    ├── gpt/route.ts      # OpenAI integration
    └── search/route.ts   # Multi-engine search
/lib/                     # Utility functions
/public/                  # Static assets
```

## 🎨 Customization

### Styling
- Uses Tailwind CSS for styling
- Custom gradient backgrounds
- Responsive design patterns
- Color-coded score indicators

### AI Prompt
- Located in `/app/api/gpt/route.ts`
- Customizable prompt for different analysis styles
- Research-informed analysis
- JSON response format

### Search Sources
- Located in `/app/api/search/route.ts`
- Add new search engines
- Modify relevance scoring
- Customize content extraction

## 🚨 Troubleshooting

### Common Issues

1. **"OpenAI API key not configured"**
   - Check `.env.local` file exists
   - Verify API key is correct
   - Restart development server

2. **Search results not loading**
   - Check internet connection
   - Some search engines may be temporarily unavailable
   - App includes fallback sources

3. **Build errors**
   - Run `npm install` to ensure dependencies
   - Check for TypeScript errors
   - Verify all imports are correct

### Debug Mode
- Check browser console for errors
- Check terminal for server logs
- API responses are logged for debugging

## 🎉 Ready to Use!

Your AI Job Doom Meter is now fully set up and ready to:
- Analyze job vulnerability to AI
- Provide evidence-based insights
- Suggest upskilling opportunities
- Recommend alternative career paths
- Deliver witty, research-backed analysis

Just add your OpenAI API key and you're good to go! 🚀