import { NextRequest, NextResponse } from 'next/server';

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

// Brave Search API
class BraveSearch {
  async search(query: string): Promise<SearchResult[]> {
    const BRAVE_API_KEY = process.env.BRAVE_API_KEY;

    if (!BRAVE_API_KEY) {
      console.error('Brave API key not configured');
      return [];
    }

    try {
      const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Accept': 'application/json',
          'X-Subscription-Token': BRAVE_API_KEY,
        },
      });

      if (!response.ok) {
        console.error('Brave API error:', await response.text());
        return [];
      }

      const data = await response.json();

      return data.web?.results?.map((r: any) => ({
        title: r.title,
        url: r.url,
        snippet: r.description,
        source: 'Brave Search',
      })) || [];
    } catch (error) {
      console.error('Brave search error:', error);
      return [];
    }
  }
}

// Main analyzer class
class JobReplacementAnalyzer {
  private searcher = new BraveSearch();

  async analyzeJob(job: string): Promise<JobAnalysis> {
    const queries = [
      `"${job}" "artificial intelligence" automation probability`,
      `AI replace "${job}" timeline research`,
      `"${job}" job security artificial intelligence study`,
      `future of "${job}" automation risk percentage`,
      `"${job}" skills AI cannot replace`,
      `"${job}" augmentation vs replacement AI`
    ];

    const searchPromises = queries.map(query => this.searcher.search(query));

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
    if (allTexp.includes('creative')) keyFactors.push('Requires creativity');
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
