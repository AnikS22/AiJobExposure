import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export interface SearchResult {
  title: string;
  url: string;
  snippet?: string;
}

async function searchDuckDuckGo(query: string): Promise<SearchResult[]> {
  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      signal: controller.signal,
    });

    const html = await response.text();
    const $ = cheerio.load(html);
    const results: SearchResult[] = [];

    $('.result').each((i, el) => {
      const title = $(el).find('.result__a').text().trim();
      const url = $(el).find('.result__a').attr('href');
      const snippet = $(el).find('.result__snippet').text().trim();

      if (title && url && url.startsWith('http')) {
        results.push({
          title,
          url,
          snippet,
        });
      }
    });

    return results;
  } catch (error) {
    console.error('[DuckDuckGo search error]', error);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { job } = await request.json();

    if (!job || typeof job !== 'string') {
      return NextResponse.json({ error: 'Job title is required' }, { status: 400 });
    }

    const queries = [
      `AI automation risk ${job}`,
      `Will AI replace ${job}?`,
      `future of ${job} and artificial intelligence`,
      `${job} job security AI`,
    ];

    // Run searches in parallel, catch failures
    const allResults = await Promise.allSettled(
      queries.map(query => searchDuckDuckGo(query))
    );

    const combinedResults: SearchResult[] = [];

    for (const result of allResults) {
      if (result.status === 'fulfilled') {
        combinedResults.push(...result.value);
      }
    }

    const unique = combinedResults
      .filter((r, i, self) => i === self.findIndex(t => t.url === r.url))
      .filter(r => !r.url.includes('duckduckgo.com') && !r.url.includes('google.com/search'))
      .slice(0, 5);

    if (unique.length > 0) {
      return NextResponse.json({ results: unique });
    }

    // If nothing found, return curated sources
    const fallback: SearchResult[] = [
      {
        title: `AI Automation and ${job} - MIT Tech Review`,
        url: `https://www.technologyreview.com/search/?q=${encodeURIComponent(job)}`
      },
      {
        title: `Future of ${job} - HBR`,
        url: `https://hbr.org/search?term=${encodeURIComponent(job)}`
      },
      {
        title: `AI Job Security - McKinsey Global Institute`,
        url: `https://www.mckinsey.com/search?q=${encodeURIComponent(job)}`
      },
      {
        title: `Academic Papers on ${job} and AI`,
        url: `https://scholar.google.com/scholar?q=AI+impact+on+${encodeURIComponent(job)}`
      }
    ];

    return NextResponse.json({ results: fallback });
  } catch (error) {
    console.error('Search API error:', error);

    const fallback: SearchResult[] = [
      {
        title: `AI & Future of Work Research`,
        url: `https://scholar.google.com/scholar?q=AI+job+automation+future`
      },
      {
        title: `Global AI Trends – Reports`,
        url: `https://www.google.com/search?q=AI+automation+future+workforce`
      }
    ];

    return NextResponse.json({ results: fallback });
  }
}