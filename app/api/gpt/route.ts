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
  aiResistanceScore?: number;
  futureProofingPlaybook?: string[];
  skillGapAnalysis?: {
    missingSkills: string[];
    emergingSkills: string[];
    humanSkills: string[];
  };
  careerPivotSimulator?: {
    saferRoles: string[];
    transitionDifficulty: string;
    pivotPath: string[];
  };
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
  "upskilling": "2-3 practical ideas for how this person can adapt, reskill, or upskill based on current research. Include both technical skills (like learning AI tools, data analysis) and soft skills (like emotional intelligence, creativity, leadership).",
  "alternatives": "2 safer career pivots or more future-proof roles based on the research",
  "joke": "One-liner summary of their job's fate. Make it smart and funny.",
  "aiResistanceScore": [0-100 score of how "human" this job really is - higher means more human skills required],
  "futureProofingPlaybook": [
    "Step 1: [Specific actionable step based on research]",
    "Step 2: [Next concrete action]",
    "Step 3: [Final step to future-proof]"
  ],
  "skillGapAnalysis": {
    "missingSkills": ["List 2-3 technical skills they need to learn"],
    "emergingSkills": ["List 2-3 new skills coming to their field"],
    "humanSkills": ["List 2-3 irreplaceable human skills to develop"]
  },
  "careerPivotSimulator": {
    "saferRoles": ["List 2-3 roles that would be safer for this person"],
    "transitionDifficulty": "Easy/Medium/Hard based on their current skills",
    "pivotPath": ["Step 1 of transition", "Step 2 of transition", "Step 3 of transition"]
  }
}

Make sure the JSON is clean and parseable.`;

    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a witty but professional career coach. Keep copy punchy, straight-talk, and friendly. Use light humor (no sarcasm aimed at the user). Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });
    } catch (openaiError: unknown) {
      // Handle OpenAI SDK errors specifically
      // OpenAI SDK errors can be Error objects with additional properties
      if (openaiError instanceof Error) {
        // Check if it's an OpenAI API error with a code property
        const errorWithCode = openaiError as Error & { code?: string; status?: number };
        if (errorWithCode.code === 'invalid_api_key' || errorWithCode.message.includes('API key')) {
          throw new Error('OpenAI API key is invalid or not configured');
        }
        if (errorWithCode.code === 'insufficient_quota' || errorWithCode.status === 429 || errorWithCode.message.includes('quota')) {
          throw new Error('OpenAI API quota exceeded');
        }
        throw openaiError;
      }
      // Handle non-Error objects (shouldn't happen with OpenAI SDK, but just in case)
      if (openaiError && typeof openaiError === 'object' && 'error' in openaiError) {
        const errorObj = openaiError as { error?: { code?: string; message?: string; type?: string } };
        if (errorObj.error?.code === 'invalid_api_key') {
          throw new Error('OpenAI API key is invalid or not configured');
        }
        if (errorObj.error?.code === 'insufficient_quota') {
          throw new Error('OpenAI API quota exceeded');
        }
        throw new Error(errorObj.error?.message || 'OpenAI API error');
      }
      throw openaiError;
    }

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
    
    // Provide more specific error messages
    if (error instanceof Error) {
      // Check for OpenAI API errors
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'OpenAI API key is invalid or not configured. Please check your environment variables.' },
          { status: 500 }
        );
      }
      if (error.message.includes('quota') || error.message.includes('429')) {
        return NextResponse.json(
          { error: 'OpenAI API quota exceeded. Please check your billing and usage limits.' },
          { status: 500 }
        );
      }
      if (error.message.includes('Invalid score')) {
        return NextResponse.json(
          { error: 'Invalid response format from AI. Please try again.' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: `Failed to analyze job: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}