'use client';

import { useState } from 'react';

interface JobAnalysis {
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
    if (score <= 40) return 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30';
    if (score <= 70) return 'text-amber-300 bg-amber-500/20 border-amber-500/30';
    return 'text-red-300 bg-red-500/20 border-red-500/30';
  };

  const getScoreEmoji = (score: number) => {
    if (score <= 40) return '✓';
    if (score <= 70) return '⚠';
    return '⚠';
  };

  const getScoreLabel = (score: number) => {
    if (score <= 40) return 'Low Risk';
    if (score <= 70) return 'Moderate Risk';
    return 'High Risk';
  };

  const getScoreMessage = (score: number) => {
    if (score <= 40) return 'You\'re in the comfy zone. Keep being gloriously human.';
    if (score <= 70) return 'Borderline toast. Add new skills before the toaster dings.';
    return 'Hot bread. Pivot, upskill, or manage the robots.';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}></div>
      </div>
      
      <div className="relative container mx-auto px-6 py-12 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-300 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
            Latest Assessment Tool
          </div>
          
          <h1 className="text-7xl font-light text-white mb-8 tracking-tight leading-tight">
            Have you wondered about<br />
            <span className="font-medium text-emerald-300">your place in the AI revolution?</span>
          </h1>
          
          <p className="text-xl text-slate-300 font-light max-w-3xl mx-auto leading-relaxed mb-12">
            We&apos;ll ask the robots, check the research, and tell you—plainly—if your job is safe, sizzling, or already toast. 
            Then we hand you a no‑nonsense plan to stay one step ahead.
          </p>

          {/* Decorative Arrows */}
          <div className="flex justify-center mb-12">
            <div className="flex space-x-4">
              <div className="w-8 h-8 border-l-2 border-b-2 border-white/30 transform rotate-45"></div>
              <div className="w-8 h-8 border-l-2 border-b-2 border-white/30 transform rotate-45 mt-2"></div>
              <div className="w-8 h-8 border-l-2 border-b-2 border-white/30 transform rotate-45"></div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => {
              const formElement = document.getElementById('jobTitle');
              if (formElement) {
                formElement.focus();
                formElement.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-2xl transition-all duration-300 text-lg shadow-lg hover:shadow-emerald-500/25"
          >
            <span className="mr-2">🧠</span>
            Take me to the quiz
            <span className="ml-2">→</span>
          </button>
        </div>

        {/* Job Input Form */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12 mb-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label htmlFor="jobTitle" className="block text-lg font-medium text-white mb-4">
                What&apos;s your job title?
              </label>
              <div className="relative">
                <input
                  id="jobTitle"
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Software Engineer, Teacher, Lawyer, Doctor..."
                  className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-white placeholder-slate-400 text-lg backdrop-blur-sm transition-all duration-300"
                  disabled={loading}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !jobTitle.trim()}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-4 px-8 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-lg shadow-lg hover:shadow-emerald-500/25"
            >
              {loading ? 'Consulting the robots…' : 'Find my vulnerability'}
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-2 border-white/20 border-t-white mx-auto mb-6"></div>
            <p className="text-xl text-white font-light">Consulting the robots… please hold your existential dread.</p>
            <p className="text-slate-400 mt-2">Scraping studies, bribing algorithms with math, and preparing plain‑English results</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8 mb-12">
            <p className="text-red-300 text-center text-lg">{error}</p>
          </div>
        )}

        {/* Results */}
        {analysis && (
          <div className="space-y-8">
            {/* Score Card */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
              <div className="text-center">
                <div className="text-8xl font-light text-white mb-6 tracking-tight">{analysis.score}</div>
                <div className={`inline-flex items-center px-8 py-4 rounded-2xl text-2xl font-medium border ${getScoreColor(analysis.score)}`}>
                  {getScoreEmoji(analysis.score)} {getScoreLabel(analysis.score)}
                </div>
                <p className="text-slate-300 mt-6 text-xl font-light">{getScoreMessage(analysis.score)}</p>
                <p className="text-slate-400 mt-3 text-lg">Vulnerability score out of 100</p>
              </div>
            </div>

            {/* Rationale */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
              <h3 className="text-3xl font-light text-white mb-8">
                Analysis
              </h3>
              <p className="text-lg text-slate-300 leading-relaxed font-light">{analysis.rationale}</p>
            </div>

            {/* Upskilling */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
              <h3 className="text-3xl font-light text-white mb-8">
                Upskilling Recommendations
              </h3>
              <p className="text-lg text-slate-300 leading-relaxed font-light">{analysis.upskilling}</p>
            </div>

            {/* Alternatives */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
              <h3 className="text-3xl font-light text-white mb-8">
                Alternative Career Paths
              </h3>
              <p className="text-lg text-slate-300 leading-relaxed font-light">{analysis.alternatives}</p>
            </div>

            {/* AI Resistance Score */}
            {analysis.aiResistanceScore && (
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-3xl p-12">
                <h3 className="text-3xl font-light text-white mb-8">
                  AI Resistance Score
                </h3>
                <div className="text-center mb-6">
                  <div className="text-6xl font-light text-blue-300 mb-4">{analysis.aiResistanceScore}</div>
                  <p className="text-lg text-blue-200">
                    How &quot;human&quot; your job really is
                  </p>
                </div>
                <p className="text-slate-300 text-center">
                  {analysis.aiResistanceScore >= 70 ? "Highly human - AI can't replace your unique skills" : 
                   analysis.aiResistanceScore >= 40 ? "Moderately human - Some skills are irreplaceable" : 
                   "Low human factor - Focus on developing unique human skills"}
                </p>
              </div>
            )}

            {/* Future-Proofing Playbook */}
            {analysis.futureProofingPlaybook && analysis.futureProofingPlaybook.length > 0 && (
              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-3xl p-12">
                <h3 className="text-3xl font-light text-white mb-8">
                  Future-Proofing Playbook
                </h3>
                <div className="space-y-4">
                  {analysis.futureProofingPlaybook.map((step, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-300 font-medium text-sm">
                        {index + 1}
                      </div>
                      <p className="text-slate-300 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skill Gap Analysis */}
            {analysis.skillGapAnalysis && (
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-3xl p-12">
                <h3 className="text-3xl font-light text-white mb-8">
                  Skill Gap Analysis
                </h3>
                <div className="grid md:grid-cols-3 gap-8">
                  <div>
                    <h4 className="text-xl font-medium text-purple-300 mb-4">Missing Skills</h4>
                    <ul className="space-y-2">
                      {analysis.skillGapAnalysis.missingSkills.map((skill, index) => (
                        <li key={index} className="text-slate-300 flex items-center">
                          <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xl font-medium text-purple-300 mb-4">Emerging Skills</h4>
                    <ul className="space-y-2">
                      {analysis.skillGapAnalysis.emergingSkills.map((skill, index) => (
                        <li key={index} className="text-slate-300 flex items-center">
                          <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xl font-medium text-purple-300 mb-4">Human Skills</h4>
                    <ul className="space-y-2">
                      {analysis.skillGapAnalysis.humanSkills.map((skill, index) => (
                        <li key={index} className="text-slate-300 flex items-center">
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Career Pivot Simulator */}
            {analysis.careerPivotSimulator && (
              <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-3xl p-12">
                <h3 className="text-3xl font-light text-white mb-8">
                  Career Pivot Simulator
                </h3>
                <div className="mb-6">
                  <h4 className="text-xl font-medium text-orange-300 mb-4">Safer Roles for You</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.careerPivotSimulator.saferRoles.map((role, index) => (
                      <span key={index} className="px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-200 text-sm">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <h4 className="text-xl font-medium text-orange-300 mb-4">Transition Difficulty: 
                    <span className={`ml-2 px-3 py-1 rounded-full text-sm ${
                      analysis.careerPivotSimulator.transitionDifficulty === 'Easy' ? 'bg-green-500/20 text-green-300' :
                      analysis.careerPivotSimulator.transitionDifficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {analysis.careerPivotSimulator.transitionDifficulty}
                    </span>
                  </h4>
                </div>
                <div>
                  <h4 className="text-xl font-medium text-orange-300 mb-4">Your Pivot Path</h4>
                  <div className="space-y-3">
                    {analysis.careerPivotSimulator.pivotPath.map((step, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-orange-500/20 border border-orange-500/30 rounded-full flex items-center justify-center text-orange-300 font-medium text-sm">
                          {index + 1}
                        </div>
                        <p className="text-slate-300 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Reality Check */}
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-3xl p-12">
              <h3 className="text-3xl font-light text-white mb-8">
                Reality Check
              </h3>
              <p className="text-lg text-amber-200 leading-relaxed font-light italic">{analysis.joke}</p>
            </div>

            {/* Research Sources */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
              <h3 className="text-3xl font-light text-white mb-8">
                Research Sources
              </h3>
              {searchLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/20 border-t-white mr-4"></div>
                  <p className="text-slate-300 text-lg">Gathering research data...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-6">
                  {searchResults.map((result, index) => (
                    <a
                      key={index}
                      href={result.url}
          target="_blank"
          rel="noopener noreferrer"
                      className="block p-6 bg-white/5 hover:bg-white/10 rounded-2xl transition-all duration-300 border border-white/10 hover:border-white/20"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-white flex-1 text-lg">{result.title}</h4>
                        {result.source && (
                          <span className="ml-4 px-3 py-1 bg-white/10 text-white text-sm rounded-full">
                            {result.source}
                          </span>
                        )}
                      </div>
                      {result.snippet && (
                        <p className="text-slate-300 mb-3 line-clamp-2 text-sm leading-relaxed">{result.snippet}</p>
                      )}
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-slate-400 truncate flex-1">{result.url}</p>
                        {result.relevanceScore && (
                          <span className="ml-4 text-xs text-slate-500">
                            Relevance: {result.relevanceScore.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic text-lg">No research sources found. Manual research recommended.</p>
              )}
            </div>

            {/* Try Another Job */}
            <div className="text-center pt-8">
              <button
                onClick={() => {
                  setAnalysis(null);
                  setSearchResults([]);
                  setJobTitle('');
                  setError('');
                }}
                className="bg-white/10 hover:bg-white/20 text-white font-medium py-4 px-8 rounded-2xl transition-all duration-300 border border-white/20 hover:border-white/40"
              >
                Analyze Another Job
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-20 pt-12 border-t border-white/10">
          <p className="text-slate-400 text-sm">
            Trusted by professionals at leading companies worldwide
          </p>
        </div>
      </div>
    </div>
  );
}