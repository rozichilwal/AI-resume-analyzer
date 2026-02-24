import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ScoreCard from '../resume/ScoreCard';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';
import { generatePDF } from '../../utils/pdfGenerator';
import React from 'react';

const AnalysisResults = () => {
    const { resumeId } = useParams();
    const navigate = useNavigate();
    const [resume, setResume] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchResume();
    }, [resumeId]);

    const fetchResume = async () => {
        try {
            const response = await api.get(`/resume/${resumeId}`);
            setResume(response.data);

            // If not analyzed yet, trigger analysis
            if (!response.data.analysis || !response.data.analysis.atsScore) {
                await analyzeResume();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch resume');
        } finally {
            setLoading(false);
        }
    };

    const analyzeResume = async () => {
        setAnalyzing(true);
        try {
            const response = await api.post(`/analysis/analyze/${resumeId}`);
            setResume((prev) => ({ ...prev, analysis: response.data.analysis }));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to analyze resume');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleDownloadPDF = () => {
        if (resume && resume.analysis) {
            generatePDF(resume);
        }
    };

    if (loading || analyzing) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader size="large" />
                <p className="mt-4 text-gray-600">
                    {analyzing ? 'Analyzing your resume...' : 'Loading...'}
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto">
                <ErrorMessage message={error} />
                <button onClick={() => navigate('/dashboard')} className="mt-4 btn-primary">
                    Back to Dashboard
                </button>
            </div>
        );
    }

    if (!resume || !resume.analysis) {
        return (
            <div className="max-w-4xl mx-auto">
                <ErrorMessage message="No analysis data available" />
            </div>
        );
    }

    const { analysis } = resume;

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{resume.filename}</h1>
                    <p className="text-gray-600">Job Role: {resume.jobRole}</p>
                </div>
                <button onClick={handleDownloadPDF} className="btn-primary">
                    Download Report
                </button>
            </div>

            {/* Score Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ScoreCard score={analysis.atsScore} filename={resume.filename} />

                {/* Score Breakdown */}
                <div className="card md:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Score Breakdown</h3>
                    <div className="space-y-3">
                        {[
                            { label: 'Format', score: analysis.formatScore, max: 100 },
                            { label: 'Keywords', score: analysis.keywordScore, max: 100 },
                            { label: 'Skills', score: analysis.skillsScore, max: 100 },
                            { label: 'Experience', score: analysis.experienceScore, max: 100 },
                            { label: 'Grammar', score: analysis.grammarScore, max: 100 },
                        ].map((item) => (
                            <div key={item.label}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>{item.label}</span>
                                    <span className="font-semibold">
                                        {item.score}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, item.score)}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Skills Found */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">Skills Found</h3>
                <div className="flex flex-wrap gap-2">
                    {analysis.skills && analysis.skills.length > 0 ? (
                        analysis.skills.map((skill, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                            >
                                {skill}
                            </span>
                        ))
                    ) : (
                        <p className="text-gray-500">No skills identified</p>
                    )}
                </div>
            </div>

            {/* Missing Skills */}
            {analysis.missingSkills && analysis.missingSkills.length > 0 && (
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Missing Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {analysis.missingSkills.map((skill, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Suggestions */}
            {analysis.suggestions && analysis.suggestions.length > 0 && (
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Improvement Suggestions</h3>
                    <ul className="space-y-2">
                        {analysis.suggestions.map((suggestion, index) => (
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
                                <span className="text-gray-700">{suggestion}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Grammar Issues */}
            {analysis.grammarIssues && analysis.grammarIssues.length > 0 && (
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Grammar & Clarity Issues</h3>
                    <ul className="space-y-2">
                        {analysis.grammarIssues.map((issue, index) => (
                            <li key={index} className="flex items-start">
                                <svg
                                    className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span className="text-gray-700">{issue}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Professional Summary */}
            {analysis.professionalSummary && (
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Professional Summary</h3>
                    <p className="text-gray-700 leading-relaxed">{analysis.professionalSummary}</p>
                </div>
            )}
        </div>
    );
};

export default AnalysisResults;
