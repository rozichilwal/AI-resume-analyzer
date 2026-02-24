import { useState, useEffect } from 'react';
import api from '../../services/api';
import ErrorMessage from '../common/ErrorMessage';
import Loader from '../common/Loader';
import React from 'react';

const JobMatcher = () => {
    const [resumes, setResumes] = useState([]);
    const [selectedResumeId, setSelectedResumeId] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [matchResult, setMatchResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        try {
            const response = await api.get('/resume');
            setResumes(response.data.resumes);
            if (response.data.resumes.length > 0) {
                setSelectedResumeId(response.data.resumes[0]._id);
            }
        } catch (err) {
            setError('Failed to fetch resumes');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMatchResult(null);

        if (!selectedResumeId) {
            setError('Please select a resume');
            return;
        }

        if (jobDescription.length < 50) {
            setError('Job description must be at least 50 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post(`/analysis/job-match/${selectedResumeId}`, {
                jobDescription,
            });
            setMatchResult(response.data.matchResult);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to match job description');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900">Job Description Matcher</h1>

            <div className="card">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <ErrorMessage message={error} onClose={() => setError('')} />

                    {/* Resume Selection */}
                    <div>
                        <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-2">
                            Select Resume
                        </label>
                        {resumes.length > 0 ? (
                            <select
                                id="resume"
                                value={selectedResumeId}
                                onChange={(e) => setSelectedResumeId(e.target.value)}
                                className="input-field"
                            >
                                {resumes.map((resume) => (
                                    <option key={resume._id} value={resume._id}>
                                        {resume.filename} - {resume.jobRole}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p className="text-gray-500">No resumes available. Please upload a resume first.</p>
                        )}
                    </div>

                    {/* Job Description */}
                    <div>
                        <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-2">
                            Job Description
                        </label>
                        <textarea
                            id="jobDescription"
                            rows={12}
                            className="input-field"
                            placeholder="Paste the job description here..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {jobDescription.length} characters (minimum 50)
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || resumes.length === 0}
                        className="w-full btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader size="small" />
                                <span className="ml-2">Analyzing...</span>
                            </>
                        ) : (
                            'Match with Job Description'
                        )}
                    </button>
                </form>
            </div>

            {/* Match Results */}
            {matchResult && (
                <div className="space-y-6 animate-slide-up">
                    {/* Match Percentage */}
                    <div className="card text-center">
                        <h3 className="text-lg font-semibold mb-4">Match Score</h3>
                        <div className="relative inline-flex items-center justify-center">
                            <svg className="w-40 h-40 transform -rotate-90">
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    stroke="currentColor"
                                    strokeWidth="10"
                                    fill="none"
                                    className={`${matchResult.matchPercentage >= 75
                                            ? 'text-success/20'
                                            : matchResult.matchPercentage >= 50
                                                ? 'text-warning/20'
                                                : 'text-danger/20'
                                        }`}
                                />
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    stroke="currentColor"
                                    strokeWidth="10"
                                    fill="none"
                                    strokeDasharray={`${(matchResult.matchPercentage / 100) * 439.82} 439.82`}
                                    className={`transition-all duration-1000 ${matchResult.matchPercentage >= 75
                                            ? 'text-success'
                                            : matchResult.matchPercentage >= 50
                                                ? 'text-warning'
                                                : 'text-danger'
                                        }`}
                                />
                            </svg>
                            <div className="absolute">
                                <div className="text-5xl font-bold">{matchResult.matchPercentage}%</div>
                            </div>
                        </div>
                        <p className="mt-4 text-gray-600">
                            {matchResult.matchPercentage >= 75
                                ? 'Excellent Match!'
                                : matchResult.matchPercentage >= 50
                                    ? 'Good Match'
                                    : 'Needs Improvement'}
                        </p>
                    </div>

                    {/* Matched Keywords */}
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4">Matched Keywords</h3>
                        <div className="flex flex-wrap gap-2">
                            {matchResult.matchedKeywords && matchResult.matchedKeywords.length > 0 ? (
                                matchResult.matchedKeywords.map((keyword, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                                    >
                                        {keyword}
                                    </span>
                                ))
                            ) : (
                                <p className="text-gray-500">No matched keywords found</p>
                            )}
                        </div>
                    </div>

                    {/* Missing Keywords */}
                    {matchResult.missingKeywords && matchResult.missingKeywords.length > 0 && (
                        <div className="card">
                            <h3 className="text-lg font-semibold mb-4">Missing Keywords</h3>
                            <div className="flex flex-wrap gap-2">
                                {matchResult.missingKeywords.map((keyword, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                                    >
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommendations */}
                    {matchResult.recommendations && matchResult.recommendations.length > 0 && (
                        <div className="card">
                            <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                            <ul className="space-y-2">
                                {matchResult.recommendations.map((recommendation, index) => (
                                    <li key={index} className="flex items-start">
                                        <svg
                                            className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span className="text-gray-700">{recommendation}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default JobMatcher;
