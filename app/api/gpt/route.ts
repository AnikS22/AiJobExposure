import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

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

    const { job } = await request.json();
    
    if (!job || typeof job !== 'string') {
      return NextResponse.json(
        { error: 'Job title is required' },
        { status: 400 }
      );
    }

    const prompt = `You are a helpful but witty career AI assistant. Analyze the following job title: "${job}"

Respond in JSON using this format:
{
  "score": [0–100 score of how automatable it is],
  "rationale": "Explain this score in simple, everyday language. Focus on what makes this job hard or easy for AI to replace. Use plain English, not technical jargon.",
  "upskilling": "2-3 practical ideas for how this person can adapt, reskill, or upskill",
  "alternatives": "2 safer career pivots or more future-proof roles",
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