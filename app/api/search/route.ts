import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export interface SearchResult {
  title: string;
  url: string;
  snippet?: string;
  source?: string;
  relevanceScore?: number;
}

export interface JobAnalysis {
  job: string;
  searchResults: SearchResult[];
  summary?: {
    riskLevel: string;
    keyFactors: string[];
    timeline: string;
  };
}

// Enhanced search with multiple engines
class MultiEngineSearch {
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
  ];

  private getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  // DuckDuckGo search
  async searchDuckDuckGo(query: string): Promise<SearchResult[]> {
    try {
      const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
        headers: {
          'User-Agent': this.getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      const html = await response.text();
      const $ = cheerio.load(html);
      const results: SearchResult[] = [];

      $('.result').each((i, el) => {
        if (i >= 10) return false;
        const title = $(el).find('.result__a').text().trim();
        const url = $(el).find('.result__a').attr('href');
        const snippet = $(el).find('.result__snippet').text().trim();

        if (title && url && url.startsWith('http')) {
          results.push({
            title,
            url,
            snippet,
            source: 'DuckDuckGo',
          });
        }
      });

      return results;
    } catch (error) {
      console.error('DuckDuckGo error:', error);
      return [];
    }
  }

  // Searx instances (privacy-focused metasearch)
  async searchSearx(query: string): Promise<SearchResult[]> {
    const searxInstances = [
      'https://searx.be',
      'https://searx.thegpm.org',
      'https://search.bus-hit.me',
    ];

    for (const instance of searxInstances) {
      try {
        const response = await fetch(`${instance}/search?q=${encodeURIComponent(query)}&format=json`, {
          headers: {
            'User-Agent': this.getRandomUserAgent(),
          },
          signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) continue;

        const data = await response.json();
        return data.results?.slice(0, 10).map((r: { title: string; url: string; content: string }) => ({
          title: r.title,
          url: r.url,
          snippet: r.content,
          source: 'Searx',
        })) || [];
      } catch {
        continue;
      }
    }
    return [];
  }

  // Brave Search
  async searchBrave(query: string): Promise<SearchResult[]> {
    try {
      const response = await fetch(`https://search.brave.com/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'User-Agent': this.getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml',
        },
      });

      const html = await response.text();
      const $ = cheerio.load(html);
      const results: SearchResult[] = [];

      $('[data-type="web"]').each((i, el) => {
        if (i >= 10) return false;
        const title = $(el).find('.title').text().trim();
        const url = $(el).find('a').attr('href');
        const snippet = $(el).find('.snippet').text().trim();

        if (title && url) {
          results.push({
            title,
            url,
            snippet,
            source: 'Brave',
          });
        }
      });

      return results;
    } catch (error) {
      console.error('Brave error:', error);
      return [];
    }
  }

  // Google Scholar for academic sources
  async searchScholar(query: string): Promise<SearchResult[]> {
    try {
      const response = await fetch(`https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`, {
        headers: {
          'User-Agent': this.getRandomUserAgent(),
        },
      });

      const html = await response.text();
      const $ = cheerio.load(html);
      const results: SearchResult[] = [];

      $('.gs_ri').each((i, el) => {
        if (i >= 5) return false;
        const title = $(el).find('.gs_rt a').text().trim();
        const url = $(el).find('.gs_rt a').attr('href');
        const snippet = $(el).find('.gs_rs').text().trim();

        if (title && url) {
          results.push({
            title,
            url,
            snippet,
            source: 'Scholar',
            relevanceScore: 1.5,
          });
        }
      });

      return results;
    } catch (error) {
      console.error('Scholar error:', error);
      return [];
    }
  }

  // Bing search
  async searchBing(query: string): Promise<SearchResult[]> {
    try {
      const response = await fetch(`https://www.bing.com/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'User-Agent': this.getRandomUserAgent(),
        },
      });

      const html = await response.text();
      const $ = cheerio.load(html);
      const results: SearchResult[] = [];

      $('.b_algo').each((i, el) => {
        if (i >= 10) return false;
        const title = $(el).find('h2 a').text().trim();
        const url = $(el).find('h2 a').attr('href');
        const snippet = $(el).find('.b_caption p').text().trim();

        if (title && url) {
          results.push({
            title,
            url,
            snippet,
            source: 'Bing',
          });
        }
      });

      return results;
    } catch (error) {
      console.error('Bing error:', error);
      return [];
    }
  }

  // Fetch and extract content from a URL
  async extractContent(url: string): Promise<string> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.getRandomUserAgent(),
        },
        signal: AbortSignal.timeout(5000),
      });

      const html = await response.text();
      const $ = cheerio.load(html);

      $('script, style').remove();

      const contentSelectors = [
        'main', 
        'article', 
        '[role="main"]',
        '.content',
        '#content',
        '.post-content',
        '.entry-content'
      ];

      let content = '';
      for (const selector of contentSelectors) {
        const element = $(selector).first();
        if (element.length) {
          content = element.text().trim();
          break;
        }
      }

      if (!content) {
        content = $('body').text().trim();
      }

      return content
        .replace(/\s+/g, ' ')
        .substring(0, 2000);
    } catch {
      return '';
    }
  }
}

// AI-specific job resources
class SpecializedSources {
  async getAIJobReports(job: string): Promise<SearchResult[]> {
    const sources = [
      {
        name: 'World Economic Forum',
        url: `https://www.weforum.org/search?query=${encodeURIComponent(job + ' automation')}`,
        weight: 1.3
      },
      {
        name: 'MIT Technology Review',
        url: `https://www.technologyreview.com/search/?q=${encodeURIComponent(job + ' AI')}`,
        weight: 1.2
      },
      {
        name: 'Brookings Institution',
        url: `https://www.brookings.edu/search/?s=${encodeURIComponent(job + ' automation')}`,
        weight: 1.2
      },
      {
        name: 'Oxford Martin School',
        url: `https://www.oxfordmartin.ox.ac.uk/?s=${encodeURIComponent(job + ' future work')}`,
        weight: 1.4
      },
      {
        name: 'McKinsey Global Institute',
        url: `https://www.mckinsey.com/search?q=${encodeURIComponent(job + ' automation')}`,
        weight: 1.3
      }
    ];

    const results: SearchResult[] = [];
    
    for (const source of sources) {
      try {
        const response = await fetch(source.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          signal: AbortSignal.timeout(3000),
        });

        if (response.ok) {
          results.push({
            title: `${source.name}: ${job} Automation Analysis`,
            url: source.url,
            snippet: `Latest research and reports on ${job} and AI automation from ${source.name}`,
            source: source.name,
            relevanceScore: source.weight
          });
        }
      } catch {
        continue;
      }
    }

    return results;
  }

  async getRedditDiscussions(job: string): Promise<SearchResult[]> {
    try {
      const subreddits = ['cscareerquestions', 'artificial', 'singularity', 'Futurology'];
      const results: SearchResult[] = [];

      for (const subreddit of subreddits) {
        const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(job + ' AI replace')}&limit=5&sort=relevance`;
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; JobSearchBot/1.0)',
          },
          signal: AbortSignal.timeout(3000),
        });

        if (!response.ok) continue;

        const data = await response.json();
        const posts = data.data?.children || [];

        for (const post of posts.slice(0, 3)) {
          const postData = post.data;
          results.push({
            title: postData.title,
            url: `https://reddit.com${postData.permalink}`,
            snippet: postData.selftext?.substring(0, 200) || '',
            source: `Reddit/${subreddit}`,
            relevanceScore: 0.8
          });
        }
      }

      return results;
    } catch {
      console.error('Reddit error');
      return [];
    }
  }
}

// Main analyzer class
class JobReplacementAnalyzer {
  private searcher = new MultiEngineSearch();
  private specialized = new SpecializedSources();

  async analyzeJob(job: string): Promise<JobAnalysis> {
    const queries = [
      `"${job}" "artificial intelligence" automation probability`,
      `AI replace "${job}" timeline research`,
      `"${job}" job security artificial intelligence study`,
      `future of "${job}" automation risk percentage`,
      `"${job}" skills AI cannot replace`,
      `"${job}" augmentation vs replacement AI`
    ];

    const searchPromises = [];

    for (const query of queries) {
      searchPromises.push(
        this.searcher.searchDuckDuckGo(query),
        this.searcher.searchBrave(query),
        this.searcher.searchBing(query),
        this.searcher.searchSearx(query)
      );
    }

    searchPromises.push(
      this.searcher.searchScholar(`${job} artificial intelligence automation study`),
      this.specialized.getAIJobReports(job),
      this.specialized.getRedditDiscussions(job)
    );

    const allResults = await Promise.allSettled(searchPromises);

    const combinedResults: SearchResult[] = [];
    const seenUrls = new Set<string>();

    for (const result of allResults) {
      if (result.status === 'fulfilled') {
        for (const item of result.value) {
          if (!seenUrls.has(item.url)) {
            seenUrls.add(item.url);
            combinedResults.push(item);
          }
        }
      }
    }

    const rankedResults = this.rankResults(combinedResults, job);

    const topUrls = rankedResults.slice(0, 5).map(r => r.url);
    const contentPromises = topUrls.map(url => this.searcher.extractContent(url));
    const contents = await Promise.allSettled(contentPromises);

    rankedResults.forEach((result, i) => {
      if (i < 5 && contents[i]?.status === 'fulfilled') {
        const content = (contents[i] as PromiseFulfilledResult<string>).value;
        if (content && content.length > (result.snippet?.length || 0)) {
          result.snippet = content.substring(0, 500);
        }
      }
    });

    const summary = this.generateSummary(rankedResults);

    return {
      job,
      searchResults: rankedResults.slice(0, 20),
      summary
    };
  }

  private rankResults(results: SearchResult[], job: string): SearchResult[] {
    const jobLower = job.toLowerCase();
    
    return results
      .map(result => {
        let score = result.relevanceScore || 1;
        
        const titleLower = result.title.toLowerCase();
        if (titleLower.includes(jobLower)) score += 0.5;
        if (titleLower.includes('ai') || titleLower.includes('artificial intelligence')) score += 0.3;
        if (titleLower.includes('automat')) score += 0.3;
        if (titleLower.includes('replace')) score += 0.2;
        if (titleLower.includes('study') || titleLower.includes('research')) score += 0.4;
        
        if (result.source === 'Scholar') score += 0.5;
        if (result.url.includes('.edu')) score += 0.4;
        if (result.url.includes('.gov')) score += 0.3;
        if (result.url.includes('weforum') || result.url.includes('mckinsey')) score += 0.3;
        
        if (result.snippet?.includes('2024') || result.snippet?.includes('2025')) score += 0.3;
        
        return { ...result, relevanceScore: score };
      })
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
  }

  private generateSummary(results: SearchResult[]): JobAnalysis['summary'] {
    const allText = results.map(r => `${r.title} ${r.snippet}`).join(' ').toLowerCase();
    
    let riskLevel = 'Medium';
    const keyFactors: string[] = [];
    let timeline = 'Next 5-10 years';

    if (allText.includes('high risk') || allText.includes('likely to be replaced')) {
      riskLevel = 'High';
    } else if (allText.includes('low risk') || allText.includes('difficult to automate')) {
      riskLevel = 'Low';
    }

    if (allText.includes('next decade') || allText.includes('10 years')) {
      timeline = 'Next 10 years';
    } else if (allText.includes('20 years') || allText.includes('long term')) {
      timeline = 'Next 10-20 years';
    } else if (allText.includes('immediate') || allText.includes('already')) {
      timeline = 'Already happening';
    }

    if (allText.includes('repetitive')) keyFactors.push('Contains repetitive tasks');
    if (allText.includes('creative')) keyFactors.push('Requires creativity');
    if (allText.includes('emotional')) keyFactors.push('Involves emotional intelligence');
    if (allText.includes('physical')) keyFactors.push('Requires physical presence');
    if (allText.includes('complex')) keyFactors.push('Involves complex decision making');

    return {
      riskLevel,
      keyFactors: keyFactors.slice(0, 5),
      timeline
    };
  }
}

// API Handler
export async function POST(request: NextRequest) {
  try {
    const { job } = await request.json();

    if (!job || typeof job !== 'string') {
      return NextResponse.json({ error: 'Job title is required' }, { status: 400 });
    }

    const analyzer = new JobReplacementAnalyzer();
    const analysis = await analyzer.analyzeJob(job);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze job',
        fallbackResults: [
          {
            title: 'Oxford Study on Job Automation',
            url: 'https://www.oxfordmartin.ox.ac.uk/publications/the-future-of-employment/',
            snippet: 'Comprehensive research on automation probability for various occupations'
          },
          {
            title: 'MIT Work of the Future Report',
            url: 'https://workofthefuture.mit.edu/',
            snippet: 'In-depth analysis of AI impact on employment'
          }
        ]
      },
      { status: 500 }
    );
  }
}
