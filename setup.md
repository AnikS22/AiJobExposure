# 🚀 Quick Setup Guide

## 1. Environment Setup

Create a `.env.local` file in the root directory with your Perplexity API key:

```bash
echo "PERPLEXITY_API_KEY=your-perplexity-api-key-here" > .env.local
```

**Get your Perplexity API key:**
1. Go to https://www.perplexity.ai/pplx-api
2. Sign in or create an account
3. Click "Generate API Key"
4. Copy the key and replace `your-perplexity-api-key-here` in `.env.local`

**🔒 Security Note:** The API key is now securely stored server-side only. No frontend exposure!

## 2. Install & Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open http://localhost:3000 in your browser.

## 3. Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variable: `OPENAI_API_KEY` with your API key
   - Deploy!

## 🎯 Test the App

Try these job titles to see the AI analysis in action:
- "Software Engineer"
- "Teacher"
- "Paralegal"
- "Data Analyst"
- "Customer Service Representative"

## 🛠️ Troubleshooting

**Build fails?** Make sure you have the `.env.local` file with a valid OpenAI API key.

**API errors?** Check that your OpenAI API key is valid and has credits.

**Styling issues?** Run `npm install` to ensure all dependencies are installed.
