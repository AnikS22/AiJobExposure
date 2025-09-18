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
      // Call both APIs in parallel
      const [gptResponse, searchResponse] = await Promise.all([
        fetch('/api/gpt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job: jobTitle.trim() }),
        }),
        fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job: jobTitle.trim() }),
        }),
      ]);

      if (!gptResponse.ok) {
        throw new Error('Failed to analyze job');
      }

      const analysisData = await gptResponse.json();
      setAnalysis(analysisData);

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        setSearchResults(searchData.results || []);
      }
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
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

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Consulting the robots...</p>
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
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-3"></div>
                  <p className="text-gray-600">Searching for real-world data...</p>
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
                      <h4 className="font-semibold text-gray-900 mb-2">{result.title}</h4>
                      {result.snippet && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{result.snippet}</p>
                      )}
                      <p className="text-xs text-gray-500 truncate">{result.url}</p>
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