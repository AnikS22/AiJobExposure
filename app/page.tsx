'use client';

import { useState } from 'react';

interface JobAnalysis {
  score: number;
  rationale: string;
  upskilling: string;
  alternatives: string;
  joke: string;
}

interface SearchResult {
  title: string;
  url: string;
  snippet?: string;
  source?: string;
  relevanceScore?: number;
}

export default function Home() {
  const [jobTitle, setJobTitle] = useState('');
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim()) return;

    setLoading(true);
    setSearchLoading(true);
    setError('');
    setAnalysis(null);
    setSearchResults([]);

    try {
      // First, get search results
      const searchResponse = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job: jobTitle.trim() }),
      });

      let searchData = null;
      if (searchResponse.ok) {
        searchData = await searchResponse.json();
        setSearchResults(searchData.searchResults || searchData.results || []);
      }

      // Then, use search results to inform AI analysis
      const gptResponse = await fetch('/api/gpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          job: jobTitle.trim(),
          searchResults: searchData?.searchResults || searchData?.results || []
        }),
      });

      if (!gptResponse.ok) {
        throw new Error('Failed to analyze job');
      }

      const analysisData = await gptResponse.json();
      setAnalysis(analysisData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score <= 40) return 'text-blue-900 bg-blue-100 border-blue-200';
    if (score <= 70) return 'text-yellow-900 bg-yellow-100 border-yellow-200';
    return 'text-red-900 bg-red-100 border-red-200';
  };

  const getScoreEmoji = (score: number) => {
    if (score <= 40) return '🔵';
    if (score <= 70) return '🟡';
    return '🔴';
  };

  const getScoreLabel = (score: number) => {
    if (score <= 40) return 'Safe';
    if (score <= 70) return 'Moderate';
    return 'Toasty';
  };

  const getScoreMessage = (score: number) => {
    if (score <= 40) return 'You&apos;re probably safe... for now 😅';
    if (score <= 70) return 'Time to start learning new skills! 📚';
    return 'RIP to your job 💀';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🧠 AI Job Doom Meter
          </h1>
          <p className="text-xl text-gray-600">
            Check if your job is AI-proof — or if it&apos;s already toast 🍞
          </p>
        </div>

        {/* Job Input Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="jobTitle" className="block text-lg font-semibold text-gray-700 mb-3">
                What&apos;s your job title?
              </label>
              <input
                id="jobTitle"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Software Engineer, Teacher, Lawyer..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg text-gray-900 bg-white placeholder-gray-500"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !jobTitle.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? 'Consulting the robots...' : 'Analyze My Job'}
            </button>
          </form>
        </div>

        {/* Loading State - AI Job Doom Game */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">🤖 AI Job Doom Game</h3>
              <p className="text-gray-600">Survive the AI takeover while we analyze your job...</p>
            </div>
            
            {/* Game Canvas */}
            <div className="relative bg-gradient-to-b from-blue-100 to-green-100 rounded-lg h-32 overflow-hidden border-2 border-gray-300" style={{
              background: 'linear-gradient(45deg, #e0f2fe 0%, #f0fdf4 50%, #fef3c7 100%)',
              backgroundSize: '400% 400%',
              animation: 'gradientShift 3s ease infinite'
            }}>
              {/* Ground */}
              <div className="absolute bottom-0 w-full h-4 bg-green-500"></div>
              
              {/* Human Character */}
              <div className="absolute bottom-4 left-4 text-2xl" style={{
                animation: 'humanRun 1s ease-in-out infinite'
              }}>
                🏃‍♂️
              </div>
              
              {/* AI Robot Obstacles */}
              <div className="absolute bottom-4 right-8 text-2xl" style={{
                animation: 'robotChase 2s linear infinite'
              }}>
                🤖
              </div>
              <div className="absolute bottom-4 right-16 text-2xl" style={{
                animation: 'robotChase 2s linear infinite',
                animationDelay: '0.5s'
              }}>
                🤖
              </div>
              <div className="absolute bottom-4 right-24 text-2xl" style={{
                animation: 'robotChase 2s linear infinite',
                animationDelay: '1s'
              }}>
                🤖
              </div>
              
              {/* Floating AI Text */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-sm font-bold text-red-600 animate-pulse">
                AI TAKEOVER IN PROGRESS...
              </div>
              
              {/* Floating Job Elements */}
              <div className="absolute top-6 left-8 text-lg animate-bounce" style={{animationDelay: '0.3s'}}>
                💼
              </div>
              <div className="absolute top-8 right-12 text-lg animate-bounce" style={{animationDelay: '0.7s'}}>
                📊
              </div>
              <div className="absolute top-10 left-1/2 text-lg animate-bounce" style={{animationDelay: '1.1s'}}>
                🎯
              </div>
              
              {/* Progress Bar */}
              <div className="absolute top-8 left-4 right-4">
                <div className="bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                </div>
                <p className="text-xs text-gray-600 mt-1 text-center">Job Analysis Progress</p>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                💡 Tip: The more robots you see, the higher your job&apos;s AI risk!
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Score Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100">
              <div className="text-center mb-6">
                <div className="text-6xl font-bold mb-2">{analysis.score}</div>
                <div className={`inline-flex items-center px-6 py-3 rounded-full text-xl font-bold border-2 ${getScoreColor(analysis.score)}`}>
                  {getScoreEmoji(analysis.score)} {getScoreLabel(analysis.score)}
                </div>
                <p className="text-gray-600 mt-3 text-lg">{getScoreMessage(analysis.score)}</p>
                <p className="text-gray-500 mt-2">Out of 100 (higher = more vulnerable to AI)</p>
              </div>
            </div>

            {/* Rationale */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                📉 Rationale
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed">{analysis.rationale}</p>
            </div>

            {/* Upskilling */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                📚 Upskilling
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed">{analysis.upskilling}</p>
            </div>

            {/* Alternatives */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                🛣️ Safer Jobs
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed">{analysis.alternatives}</p>
            </div>

            {/* Joke */}
            <div className="bg-gradient-to-r from-pink-100 to-red-100 rounded-2xl shadow-xl p-8 border-2 border-pink-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                🤣 Reality Check
              </h3>
              <p className="text-lg text-gray-800 leading-relaxed italic font-medium">{analysis.joke}</p>
            </div>

            {/* Reality Check - Sources */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                🔍 Reality Check – Sources
              </h3>
              {searchLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <div className="flex space-x-1">
                      <span className="text-2xl animate-bounce">🔍</span>
                      <span className="text-2xl animate-bounce" style={{animationDelay: '0.1s'}}>📊</span>
                      <span className="text-2xl animate-bounce" style={{animationDelay: '0.2s'}}>🤖</span>
                    </div>
                  </div>
                  <p className="text-gray-600 ml-4">Hunting for AI research data...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.map((result, index) => (
                    <a
                      key={index}
                      href={result.url}
          target="_blank"
          rel="noopener noreferrer"
                      className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 border-l-4 border-purple-500"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900 flex-1">{result.title}</h4>
                        {result.source && (
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {result.source}
                          </span>
                        )}
                      </div>
                      {result.snippet && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{result.snippet}</p>
                      )}
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500 truncate flex-1">{result.url}</p>
                        {result.relevanceScore && (
                          <span className="ml-2 text-xs text-gray-400">
                            Score: {result.relevanceScore.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 italic">No additional sources found. Try searching manually for more information.</p>
              )}
            </div>

            {/* Try Another Job */}
            <div className="text-center">
              <button
                onClick={() => {
                  setAnalysis(null);
                  setSearchResults([]);
                  setJobTitle('');
                  setError('');
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Analyze Another Job
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}