const axios = require('axios');
const { sanitizeText } = require('../utils/validators');
const {
    generateResumeAnalysisPrompt,
    generateSkillExtractionPrompt,
    generateJobMatchPrompt,
    generateGrammarCheckPrompt,
    generateImprovementPrompt
} = require('../utils/prompts');

// FREE Rule-Based AI Analysis (no external API required!)
const analyzeResumeWithRules = (resumeText, jobRole) => {
    const text = resumeText.toLowerCase();
    const words = resumeText.split(/\s+/);
    const lines = resumeText.split('\n');

    // Common skills database
    const technicalSkills = {
        'Frontend Developer': ['react', 'vue', 'angular', 'javascript', 'typescript', 'html', 'css', 'sass', 'webpack'],
        'Backend Developer': ['node', 'python', 'java', 'sql', 'mongodb', 'postgresql', 'api', 'rest', 'graphql'],
        'Full Stack Developer': ['react', 'node', 'javascript', 'typescript', 'mongodb', 'sql', 'api', 'git'],
        'Data Scientist': ['python', 'r', 'machine learning', 'tensorflow', 'pandas', 'numpy', 'sql', 'statistics'],
        'DevOps Engineer': ['docker', 'kubernetes', 'aws', 'azure', 'jenkins', 'terraform', 'linux', 'ci/cd'],
        'General': ['communication', 'teamwork', 'problem solving', 'leadership', 'project management']
    };

    const requiredSkills = technicalSkills[jobRole] || technicalSkills['General'];

    // Find skills present in resume
    const foundSkills = requiredSkills.filter(skill =>
        text.includes(skill.toLowerCase())
    );

    // Find missing skills
    const missingSkills = requiredSkills.filter(skill =>
        !text.includes(skill.toLowerCase())
    );

    // Placeholder functions for rule-based analysis
    // In a real application, these would contain detailed logic.
    const calculateFormatScore = (lines, words) => {
        let score = 0;
        // Example: Check for consistent headings, bullet points, etc.
        if (lines.some(line => line.trim().startsWith('Education'))) score += 20;
        if (lines.some(line => line.trim().startsWith('Experience'))) score += 20;
        if (lines.some(line => line.trim().startsWith('Skills'))) score += 20;
        if (words.length > 200 && words.length < 800) score += 20; // Optimal length
        if (lines.every(line => line.length < 100)) score += 20; // Readability
        return Math.min(100, score);
    };

    const calculateKeywordScore = (text, jobRole) => {
        let score = 0;
        const jobKeywords = (technicalSkills[jobRole] || technicalSkills['General']).concat(['experience', 'responsible', 'developed', 'managed']);
        const foundKeywords = jobKeywords.filter(keyword => text.includes(keyword.toLowerCase()));
        score = (foundKeywords.length / jobKeywords.length) * 100;
        return Math.min(100, score);
    };

    const calculateExperienceScore = (text) => {
        let score = 0;
        if (text.includes('years of experience') || text.includes('yr experience')) score += 50;
        if (text.includes('senior') || text.includes('lead')) score += 30;
        if (text.match(/\d{4}-\d{4}/g)) score += 20; // Date ranges
        return Math.min(100, score);
    };

    const calculateGrammarScore = (resumeText) => {
        // Very basic check: count common grammar errors (e.g., "its" vs "it's")
        let errors = 0;
        if (resumeText.includes('its a')) errors++;
        if (resumeText.includes('dont')) errors++;
        if (resumeText.includes('cant')) errors++;
        return Math.max(0, 100 - (errors * 20)); // Deduct points for each error
    };

    const findGrammarIssues = (resumeText) => {
        const issues = [];
        if (resumeText.includes('its a')) issues.push({ type: 'Grammar', text: 'Consider "it\'s a" instead of "its a".' });
        if (resumeText.includes('dont')) issues.push({ type: 'Grammar', text: 'Consider "don\'t" instead of "dont".' });
        if (resumeText.includes('cant')) issues.push({ type: 'Grammar', text: 'Consider "can\'t" instead of "cant".' });
        return issues;
    };

    const generateSuggestions = (atsScore, foundSkillsCount, missingSkillsCount) => {
        const suggestions = [];
        if (atsScore < 60) {
            suggestions.push('Your resume could be better optimized for ATS. Consider adding more keywords from job descriptions.');
        }
        if (missingSkillsCount > 0) {
            suggestions.push('Review the missing skills and try to incorporate them if you have experience in those areas.');
        }
        if (foundSkillsCount < 5) {
            suggestions.push('Highlight your key skills more prominently.');
        }
        return suggestions;
    };

    const generateSummary = (resumeText, jobRole) => {
        // Simple summary generation based on keywords
        if (resumeText.includes('experienced') && resumeText.includes(jobRole.toLowerCase())) {
            return `Experienced professional in ${jobRole} with a strong background in relevant technologies.`;
        }
        return 'A dedicated professional seeking new opportunities.';
    };

    // Calculate scores
    const skillsScore = Math.min(100, (foundSkills.length / requiredSkills.length) * 100);
    const formatScore = calculateFormatScore(lines, words);
    const keywordScore = calculateKeywordScore(text, jobRole);
    const experienceScore = calculateExperienceScore(text);
    const grammarScore = calculateGrammarScore(resumeText);

    const atsScore = Math.round(
        (skillsScore * 0.3) +
        (formatScore * 0.2) +
        (keywordScore * 0.2) +
        (experienceScore * 0.2) +
        (grammarScore * 0.1)
    );

    return {
        atsScore,
        formatScore: Math.round(formatScore),
        keywordScore: Math.round(keywordScore),
        skillsScore: Math.round(skillsScore),
        experienceScore: Math.round(experienceScore),
        grammarScore: Math.round(grammarScore),
        skills: foundSkills,
        missingSkills: missingSkills.slice(0, 5),
        grammarIssues: findGrammarIssues(resumeText),
        suggestions: generateSuggestions(atsScore, foundSkills.length, missingSkills.length),
        professionalSummary: generateSummary(resumeText, jobRole)
    };
};

/**
 * Analyze resume using Google Gemini AI
 * @param {string} resumeText - Extracted resume text
 * @param {string} jobRole - Target job role
 * @returns {Promise<Object>} Analysis results
 */
const analyzeResume = async (resumeText, jobRole = 'General') => {
    try {
        // Sanitize input
        const sanitizedText = sanitizeText(resumeText);
        const sanitizedRole = sanitizeText(jobRole);

        // Use FREE rule-based analysis (no API needed!)
        const analysis = analyzeResumeWithRules(sanitizedText, sanitizedRole);

        return analysis;
    } catch (error) {
        console.error('Error analyzing resume:', error);
        throw new Error(`Resume analysis failed: ${error.message}`);
    }
};

/**
 * Extract skills from resume
 * @param {string} resumeText - Extracted resume text
 * @param {string} jobRole - Target job role
 * @returns {Promise<Object>} Extracted skills
 */
const extractSkills = async (resumeText, jobRole = 'General') => {
    try {
        const sanitizedText = sanitizeText(resumeText);
        const sanitizedRole = sanitizeText(jobRole);

        // Use rule-based skill extraction
        const analysis = analyzeResumeWithRules(sanitizedText, sanitizedRole);

        return {
            technicalSkills: analysis.skills,
            softSkills: [],
            tools: [],
            frameworks: []
        };
    } catch (error) {
        console.error('Error extracting skills:', error);
        return {
            technicalSkills: [],
            softSkills: [],
            tools: [],
            frameworks: []
        };
    }
};

/**
 * Match resume with job description
 * @param {string} resumeText - Extracted resume text
 * @param {string} jobDescription - Job description text
 * @returns {Promise<Object>} Match results
 */
const matchJobDescription = async (resumeText, jobDescription) => {
    try {
        const sanitizedResume = sanitizeText(resumeText);
        const sanitizedJob = sanitizeText(jobDescription);

        // Simple keyword matching
        const resumeWords = sanitizedResume.toLowerCase().split(/\s+/);
        const jobWords = sanitizedJob.toLowerCase().split(/\s+/);

        // Find common keywords (excluding common words)
        const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
        const jobKeywords = jobWords.filter(word => word.length > 3 && !commonWords.has(word));
        const matchedKeywords = jobKeywords.filter(keyword => resumeWords.includes(keyword));
        const missingKeywords = jobKeywords.filter(keyword => !resumeWords.includes(keyword)).slice(0, 10);

        const matchPercentage = Math.round((matchedKeywords.length / jobKeywords.length) * 100);

        return {
            matchPercentage,
            matchedKeywords: [...new Set(matchedKeywords)].slice(0, 10),
            missingKeywords: [...new Set(missingKeywords)],
            recommendations: [
                matchPercentage < 60 ? 'Consider adding more relevant keywords from the job description' : 'Good keyword match!',
                'Highlight your relevant experience more prominently',
                'Tailor your resume to match the job requirements'
            ]
        };
    } catch (error) {
        console.error('Error matching job description:', error);
        throw new Error(`Job matching failed: ${error.message}`);
    }
};

/**
 * Check grammar in resume
 * @param {string} resumeText - Extracted resume text
 * @returns {Promise<Array>} Grammar issues
 */
const checkGrammar = async (resumeText) => {
    try {
        const sanitizedText = sanitizeText(resumeText);

        // Use rule-based grammar checking
        const analysis = analyzeResumeWithRules(sanitizedText, 'General');

        return analysis.grammarIssues;
    } catch (error) {
        console.error('Error checking grammar:', error);
        return [];
    }
};

/**
 * Parse AI response and extract JSON
 * @param {string} text - AI response text
 * @returns {Object|Array} Parsed JSON
 */
const parseAIResponse = (text) => {
    try {
        // Remove markdown code blocks if present
        let cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        // Try to find JSON in the response
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) {
            cleanedText = jsonMatch[0];
        }

        return JSON.parse(cleanedText);
    } catch (error) {
        console.error('Error parsing AI response:', error);
        console.error('Response text:', text);
        throw new Error('Failed to parse AI response as JSON');
    }
};

/**
 * Test API connection
 * @returns {Promise<boolean>} True if connected
 */
const testConnection = async () => {
    try {
        // Rule-based analysis doesn't need external API
        return true;
    } catch (error) {
        console.error('Connection test failed:', error);
        return false;
    }
};

module.exports = {
    analyzeResume,
    extractSkills,
    matchJobDescription,
    checkGrammar,
    testConnection
};
