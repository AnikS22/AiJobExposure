import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export interface SearchResult {
  title: string;
  url: string;
  snippet?: string;
  source?: string;
  relevanceScore?: number;
}

export interface JobAnalysis {
  score: number;
  rationale: string;
  upskilling: string;
  alternatives: string;
  joke: string;
}

// Initialize OpenAI client conditionally to prevent build-time errors
let openai: OpenAI | null = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function POST(request: NextRequest) {
  try {
    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const { job, searchResults = [] } = await request.json();
    
    if (!job || typeof job !== 'string') {
      return NextResponse.json(
        { error: 'Job title is required' },
        { status: 400 }
      );
    }

    // Build search results context
    const searchContext = searchResults.length > 0 
      ? `\n\nBased on the following research findings:\n${searchResults.map((result: SearchResult, index: number) => 
          `${index + 1}. ${result.title} (${result.source || 'Unknown'})\n   ${result.snippet || 'No snippet available'}\n   URL: ${result.url}\n`
        ).join('\n')}`
      : '\n\nNote: No specific research data was found for this job. Base your analysis on general AI automation trends.';

    const prompt = `You are a helpful but witty career AI assistant. Analyze the following job title: "${job}"${searchContext}

IMPORTANT: Use the research findings above to inform your analysis. If specific studies, reports, or data are mentioned, reference them in your rationale. If no research is available, use general AI automation knowledge.

Respond in JSON using this format:
{
  "score": [0–100 score of how automatable it is, based on the research findings],
  "rationale": "Explain this score in simple, everyday language. Reference specific research findings when available. Focus on what makes this job hard or easy for AI to replace. Use plain English, not technical jargon.",
  "upskilling": "2-3 practical ideas for how this person can adapt, reskill, or upskill based on current research",
  "alternatives": "2 safer career pivots or more future-proof roles based on the research",
  "joke": "One-liner summary of their job's fate. Make it smart and funny."
}

Make sure the JSON is clean and parseable.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful career AI assistant. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Log the full response for debugging
    console.log('OpenAI Response:', response);

    // Extract JSON from markdown code blocks if present
    let jsonString = response;
    if (response.includes('```json')) {
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonString = jsonMatch[1].trim();
      }
    } else if (response.includes('```')) {
      const jsonMatch = response.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonString = jsonMatch[1].trim();
      }
    }

    // Parse the JSON response
    const analysis = JSON.parse(jsonString) as JobAnalysis;
    
    // Validate the response structure
    if (typeof analysis.score !== 'number' || 
        analysis.score < 0 || analysis.score > 100) {
      throw new Error('Invalid score in response');
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error analyzing job:', error);
    return NextResponse.json(
      { error: 'Failed to analyze job. Please try again.' },
      { status: 500 }
    );
  }
}