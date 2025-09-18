# 🧠 AI Job Doom Meter

A fun and insightful web app that analyzes how vulnerable your job is to AI automation. Built with Next.js, TypeScript, and OpenAI GPT-4o.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Environment Variables
Create a `.env.local` file in the root directory:
```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
```

Get your OpenAI API key from: https://platform.openai.com/api-keys

### 3. Run Locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deploy to Vercel

### 1. Push to GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variable: `OPENAI_API_KEY`
5. Deploy!

## 🎯 Features

- **AI-Powered Analysis**: Uses GPT-4o to analyze job vulnerability
- **Secure API**: Server-side OpenAI integration (no frontend key exposure)
- **Enhanced Web Search**: Multi-query DuckDuckGo search with snippets and quality filtering
- **Beautiful UI**: Responsive design with Tailwind CSS
- **Smart Scoring**: 0-100 vulnerability score with color-coded results and humor
- **Actionable Insights**: Upskilling suggestions and alternative career paths
- **Reality Check**: Links to real research and industry reports
- **Loading States**: Engaging user experience with parallel API calls

## 🛠️ Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **OpenAI SDK** for AI analysis
- **Vercel** for deployment

## 📁 Project Structure

```
/app
├── page.tsx         # Main UI component
├── layout.tsx       # App layout with metadata
└── api/
    ├── gpt/route.ts     # Secure OpenAI API endpoint
    └── search/route.ts   # DuckDuckGo search API endpoint
.env.local           # Environment variables
```

## 🔍 Enhanced Search Features

- **Multi-Query Search**: Uses 4 different search queries for comprehensive results
- **Quality Filtering**: Removes duplicates and low-quality results
- **Snippet Display**: Shows search result snippets for better context
- **Fallback System**: Curated high-quality sources when search fails
- **Rate Limiting**: Built-in error handling and graceful degradation

## 🎨 Future Enhancements

- Add Supabase for job search logging
- Integrate Perplexity API for citation-based validation
- Add bar graphs for doom scores
- Funny avatars for different job types
- Social sharing features
- Search result caching for better performance

## 🤝 Contributing

This is a bootcamp project! Feel free to fork and add your own features.

## 📄 License

MIT License - feel free to use this for your own projects!