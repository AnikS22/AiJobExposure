import { NextRequest, NextResponse } from 'next/server';

export interface SearchResult {
  title: string;
  url: string;
  snippet?: string;
}

// Enhanced DuckDuckGo search using their HTML search endpoint
async function searchDuckDuckGo(query: string): Promise<SearchResult[]> {
  try {
    // Use DuckDuckGo's HTML search endpoint for better results
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = await response.text();
    
    // Parse HTML to extract search results
    const results: SearchResult[] = [];
    
    // Extract results using regex patterns (DuckDuckGo HTML structure)
    const resultPattern = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
    const snippetPattern = /<a[^>]+class="result__snippet"[^>]*>([^<]+)<\/a>/g;
    
    let match;
    const urls: string[] = [];
    const titles: string[] = [];
    const snippets: string[] = [];
    
    // Extract URLs and titles
    while ((match = resultPattern.exec(html)) !== null) {
      urls.push(match[1]);
      titles.push(match[2]);
    }
    
    // Extract snippets
    while ((match = snippetPattern.exec(html)) !== null) {
      snippets.push(match[1]);
    }
    
    // Combine results
    for (let i = 0; i < Math.min(urls.length, titles.length, 5); i++) {
      results.push({
        title: titles[i],
        url: urls[i],
        snippet: snippets[i] || ''
      });
    }
    
    return results;
  } catch (error) {
    console.error('DuckDuckGo search error:', error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const { job } = await request.json();
    
    if (!job || typeof job !== 'string') {
      return NextResponse.json(
        { error: 'Job title is required' },
        { status: 400 }
      );
    }

    // Multiple search queries for comprehensive results
    const searchQueries = [
      `AI automation risk ${job}`,
      `AI replacing ${job} jobs`,
      `future of ${job} artificial intelligence`,
      `${job} job security AI`
    ];
    
    const allResults: SearchResult[] = [];
    
    // Search with multiple queries
    for (const query of searchQueries) {
      const results = await searchDuckDuckGo(query);
      allResults.push(...results);
    }
    
    // Remove duplicates and filter quality results
    const uniqueResults = allResults.filter((result, index, self) => 
      index === self.findIndex(r => r.url === result.url)
    ).filter(result => 
      result.url.includes('http') && 
      !result.url.includes('duckduckgo.com') &&
      !result.url.includes('google.com/search')
    );
    
    // If we have good results, return them
    if (uniqueResults.length > 0) {
      return NextResponse.json({ 
        results: uniqueResults.slice(0, 4).map(result => ({
          title: result.title,
          url: result.url
        }))
      });
    }
    
    // Fallback: Create curated search links
    const fallbackResults: SearchResult[] = [
      {
        title: `AI Automation and ${job} - MIT Technology Review`,
        url: `https://www.technologyreview.com/search/?q=AI+automation+${encodeURIComponent(job)}`
      },
      {
        title: `How AI is Changing ${job} - Harvard Business Review`,
        url: `https://hbr.org/search?term=AI+automation+${encodeURIComponent(job)}`
      },
      {
        title: `Future of Work: ${job} and AI - McKinsey Global Institute`,
        url: `https://www.mckinsey.com/search?q=AI+automation+${encodeURIComponent(job)}`
      },
      {
        title: `AI Job Displacement Research - Academic Papers`,
        url: `https://scholar.google.com/scholar?q=AI+automation+${encodeURIComponent(job)}+job+displacement`
      }
    ];
    
    return NextResponse.json({ results: fallbackResults });
  } catch (error) {
    console.error('Error searching for job info:', error);
    
    // Final fallback results
    const fallbackResults: SearchResult[] = [
      {
        title: `AI Automation Research Papers`,
        url: `https://scholar.google.com/scholar?q=AI+automation+job+security`
      },
      {
        title: `Future of Work in the AI Era - Industry Reports`,
        url: `https://www.google.com/search?q=AI+automation+risk+future+work`
      }
    ];
    
    return NextResponse.json({ results: fallbackResults });
  }
}
