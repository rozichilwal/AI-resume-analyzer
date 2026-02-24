/**
 * Semantic matching service for job description comparison
 * Uses TF-IDF and cosine similarity for free semantic matching
 */

/**
 * Calculate TF-IDF scores for text
 * @param {string} text - Input text
 * @returns {Object} Word frequency map
 */
const calculateTFIDF = (text) => {
    const words = text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2); // Filter out short words

    const wordFreq = {};
    words.forEach(word => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    return wordFreq;
};

/**
 * Extract keywords from text using frequency analysis
 * @param {string} text - Input text
 * @param {number} topN - Number of top keywords to extract
 * @returns {Array} Top keywords
 */
const extractKeywords = (text, topN = 20) => {
    const commonWords = new Set([
        'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
        'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
        'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
        'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what'
    ]);

    const wordFreq = calculateTFIDF(text);

    // Filter out common words
    const filteredWords = Object.entries(wordFreq)
        .filter(([word]) => !commonWords.has(word))
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN)
        .map(([word]) => word);

    return filteredWords;
};

/**
 * Calculate cosine similarity between two texts
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @returns {number} Similarity score (0-1)
 */
const calculateCosineSimilarity = (text1, text2) => {
    const freq1 = calculateTFIDF(text1);
    const freq2 = calculateTFIDF(text2);

    // Get all unique words
    const allWords = new Set([...Object.keys(freq1), ...Object.keys(freq2)]);

    // Calculate dot product and magnitudes
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    allWords.forEach(word => {
        const val1 = freq1[word] || 0;
        const val2 = freq2[word] || 0;

        dotProduct += val1 * val2;
        magnitude1 += val1 * val1;
        magnitude2 += val2 * val2;
    });

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) {
        return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
};

/**
 * Extract n-grams from text
 * @param {string} text - Input text
 * @param {number} n - N-gram size
 * @returns {Array} N-grams
 */
const extractNGrams = (text, n = 2) => {
    const words = text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 0);

    const ngrams = [];
    for (let i = 0; i <= words.length - n; i++) {
        ngrams.push(words.slice(i, i + n).join(' '));
    }

    return ngrams;
};

/**
 * Find matching keywords between resume and job description
 * @param {string} resumeText - Resume text
 * @param {string} jobDescription - Job description text
 * @returns {Object} Matched and missing keywords
 */
const findMatchingKeywords = (resumeText, jobDescription) => {
    const resumeKeywords = new Set(extractKeywords(resumeText, 50));
    const jobKeywords = extractKeywords(jobDescription, 30);

    const matched = [];
    const missing = [];

    jobKeywords.forEach(keyword => {
        if (resumeKeywords.has(keyword)) {
            matched.push(keyword);
        } else {
            missing.push(keyword);
        }
    });

    return { matched, missing };
};

/**
 * Calculate semantic match percentage
 * @param {string} resumeText - Resume text
 * @param {string} jobDescription - Job description text
 * @returns {number} Match percentage (0-100)
 */
const calculateMatchPercentage = (resumeText, jobDescription) => {
    // Use cosine similarity as base
    const similarity = calculateCosineSimilarity(resumeText, jobDescription);

    // Also check keyword overlap
    const { matched, missing } = findMatchingKeywords(resumeText, jobDescription);
    const keywordMatch = matched.length / (matched.length + missing.length);

    // Combine both metrics (weighted average)
    const matchPercentage = (similarity * 0.6 + keywordMatch * 0.4) * 100;

    return Math.round(matchPercentage);
};

module.exports = {
    calculateTFIDF,
    extractKeywords,
    calculateCosineSimilarity,
    extractNGrams,
    findMatchingKeywords,
    calculateMatchPercentage
};
