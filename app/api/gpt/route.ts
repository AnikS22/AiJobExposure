import { NextRequest, NextResponse } from 'next/server';

export interface JobAnalysis {
  score: number;
  rationale: string;
  upskilling: string;
  alternatives: string;
  joke: string;
}

export async function POST(request: NextRequest) {
  try {
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    
    if (!perplexityApiKey) {
      return NextResponse.json(
        { error: 'Perplexity API key not configured' },
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

    const prompt = `Analyze the AI automation risk for the job title: "${job}"

Provide a JSON response with this exact format:
{
  "score": [0-100 number indicating automation risk, where 0=very safe, 100=highly vulnerable],
  "rationale": "Explain this score in simple, everyday language. Focus on what makes this job hard or easy for AI to replace. Use plain English, not technical jargon.",
  "upskilling": "2-3 practical ideas for how this person can adapt, reskill, or upskill",
  "alternatives": "2 safer career pivots or more future-proof roles",
  "joke": "One-liner summary of their job's fate. Make it smart and funny."
}

Base your analysis on current research and real-world examples. Use recent data about AI automation trends.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful career AI assistant. Always respond with valid JSON. Be precise and research-backed in your analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from Perplexity API');
    }

    // Log the full response for debugging
    console.log('Perplexity Response:', content);

    // Extract JSON from markdown code blocks if present
    let jsonString = content;
    if (content.includes('```json')) {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonString = jsonMatch[1].trim();
      }
    } else if (content.includes('```')) {
      const jsonMatch = content.match(/```\s*([\s\S]*?)\s*```/);
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