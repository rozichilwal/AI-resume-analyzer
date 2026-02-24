const axios = require('axios');
const Resume = require('../models/Resume');
const { analyzeResume, matchJobDescription } = require('../services/aiService');
const { findMatchingKeywords, calculateMatchPercentage } = require('../services/matchingService');

/**
 * Analyze resume with AI
 * @route POST /api/analysis/analyze/:resumeId
 */
const analyzeResumeById = async (req, res) => {
    try {
        const resume = await Resume.findOne({
            _id: req.params.resumeId,
            userId: req.user._id
        });

        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        // Check if already analyzed
        if (resume.analysis && resume.analysis.atsScore) {
            return res.json({
                message: 'Resume already analyzed',
                analysis: resume.analysis
            });
        }

        // Perform AI analysis
        const analysisResult = await analyzeResume(resume.originalText, resume.jobRole);

        // Update resume with analysis
        resume.analysis = analysisResult;
        await resume.save();

        res.json({
            message: 'Resume analyzed successfully',
            analysis: analysisResult
        });
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ message: 'Failed to analyze resume', error: error.message });
    }
};

/**
 * Re-analyze resume (force new analysis)
 * @route POST /api/analysis/reanalyze/:resumeId
 */
const reanalyzeResume = async (req, res) => {
    try {
        const resume = await Resume.findOne({
            _id: req.params.resumeId,
            userId: req.user._id
        });

        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        // Perform AI analysis
        const analysisResult = await analyzeResume(resume.originalText, resume.jobRole);

        // Update resume with analysis
        resume.analysis = analysisResult;
        await resume.save();

        res.json({
            message: 'Resume re-analyzed successfully',
            analysis: analysisResult
        });
    } catch (error) {
        console.error('Re-analysis error:', error);
        res.status(500).json({ message: 'Failed to re-analyze resume', error: error.message });
    }
};

/**
 * Match resume with job description
 * @route POST /api/analysis/job-match/:resumeId
 */
const matchWithJob = async (req, res) => {
    try {
        const { jobDescription } = req.body;

        if (!jobDescription || jobDescription.trim().length < 50) {
            return res.status(400).json({ message: 'Please provide a valid job description (minimum 50 characters)' });
        }

        const resume = await Resume.findOne({
            _id: req.params.resumeId,
            userId: req.user._id
        });

        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        // Use AI for detailed matching
        const aiMatchResult = await matchJobDescription(resume.originalText, jobDescription);

        // Also use local semantic matching for backup
        const localMatch = findMatchingKeywords(resume.originalText, jobDescription);
        const localPercentage = calculateMatchPercentage(resume.originalText, jobDescription);

        // Combine results (prefer AI but fallback to local)
        const matchResult = {
            matchPercentage: aiMatchResult.matchPercentage || localPercentage,
            matchedKeywords: aiMatchResult.matchedKeywords.length > 0
                ? aiMatchResult.matchedKeywords
                : localMatch.matched,
            missingKeywords: aiMatchResult.missingKeywords.length > 0
                ? aiMatchResult.missingKeywords
                : localMatch.missing,
            recommendations: aiMatchResult.recommendations || []
        };

        // Save match result to resume
        resume.jobMatchResults.push({
            jobDescription,
            ...matchResult
        });
        await resume.save();

        res.json({
            message: 'Job matching completed',
            matchResult
        });
    } catch (error) {
        console.error('Job matching error:', error);
        res.status(500).json({ message: 'Failed to match with job description', error: error.message });
    }
};

/**
 * Get dashboard analytics
 * @route GET /api/analysis/dashboard
 */
const getDashboard = async (req, res) => {
    try {
        const resumes = await Resume.find({ userId: req.user._id })
            .select('filename analysis.atsScore jobRole createdAt')
            .sort({ createdAt: -1 });

        // Calculate statistics
        const totalResumes = resumes.length;
        const analyzedResumes = resumes.filter(r => r.analysis && r.analysis.atsScore).length;

        const scores = resumes
            .filter(r => r.analysis && r.analysis.atsScore)
            .map(r => r.analysis.atsScore);

        const averageScore = scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 0;

        const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
        const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

        // Score trend data (last 10 analyses)
        const scoreTrend = resumes
            .filter(r => r.analysis && r.analysis.atsScore)
            .slice(0, 10)
            .reverse()
            .map(r => ({
                date: r.createdAt,
                score: r.analysis.atsScore,
                filename: r.filename
            }));

        res.json({
            statistics: {
                totalResumes,
                analyzedResumes,
                averageScore,
                highestScore,
                lowestScore
            },
            scoreTrend,
            recentResumes: resumes.slice(0, 5)
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard data', error: error.message });
    }
};

module.exports = {
    analyzeResumeById,
    reanalyzeResume,
    matchWithJob,
    getDashboard
};
