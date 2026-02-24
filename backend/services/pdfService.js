const pdf = require('pdf-parse');
const fs = require('fs').promises;

/**
 * Extract text from PDF file
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<string>} Extracted text
 */
const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdf(dataBuffer);

        // Clean and normalize the extracted text
        const cleanedText = cleanText(data.text);

        if (!cleanedText || cleanedText.length < 50) {
            throw new Error('PDF appears to be empty or contains insufficient text');
        }

        return cleanedText;
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
};

/**
 * Clean and normalize extracted text
 * @param {string} text - Raw extracted text
 * @returns {string} Cleaned text
 */
const cleanText = (text) => {
    if (!text) return '';

    return text
        // Remove excessive whitespace
        .replace(/\s+/g, ' ')
        // Remove special characters that might interfere with analysis
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
        // Normalize line breaks
        .replace(/\r\n/g, '\n')
        // Remove multiple consecutive newlines
        .replace(/\n{3,}/g, '\n\n')
        // Trim whitespace
        .trim();
};

/**
 * Validate PDF file
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<boolean>} True if valid
 */
const validatePDF = async (filePath) => {
    try {
        const stats = await fs.stat(filePath);

        // Check file size (max 5MB)
        if (stats.size > 5 * 1024 * 1024) {
            throw new Error('PDF file is too large (max 5MB)');
        }

        // Try to read the file
        const dataBuffer = await fs.readFile(filePath);

        // Check if it's a valid PDF (starts with %PDF)
        const header = dataBuffer.slice(0, 5).toString();
        if (!header.startsWith('%PDF')) {
            throw new Error('File is not a valid PDF');
        }

        return true;
    } catch (error) {
        throw new Error(`PDF validation failed: ${error.message}`);
    }
};

module.exports = {
    extractTextFromPDF,
    cleanText,
    validatePDF
};
