const Resume = require('../models/Resume');
const { extractTextFromPDF, validatePDF } = require('../services/pdfService');
const fs = require('fs').promises;

/**
 * Upload and process resume
 * @route POST /api/resume/upload
 */
const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a PDF file' });
        }

        const { jobRole } = req.body;

        // Validate PDF
        await validatePDF(req.file.path);

        // Extract text from PDF
        const extractedText = await extractTextFromPDF(req.file.path);

        // Create resume record
        const resume = await Resume.create({
            userId: req.user._id,
            filename: req.file.originalname,
            filePath: req.file.path,
            originalText: extractedText,
            jobRole: jobRole || 'General'
        });

        res.status(201).json({
            message: 'Resume uploaded successfully',
            resume: {
                _id: resume._id,
                filename: resume.filename,
                jobRole: resume.jobRole,
                createdAt: resume.createdAt
            }
        });
    } catch (error) {
        console.error('Resume upload error:', error);

        // Clean up uploaded file if there was an error
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }

        res.status(500).json({ message: 'Failed to upload resume', error: error.message });
    }
};

/**
 * Get all resumes for current user
 * @route GET /api/resume
 */
const getResumes = async (req, res) => {
    try {
        const resumes = await Resume.find({ userId: req.user._id })
            .select('-originalText -filePath')
            .sort({ createdAt: -1 });

        res.json({
            count: resumes.length,
            resumes
        });
    } catch (error) {
        console.error('Get resumes error:', error);
        res.status(500).json({ message: 'Failed to fetch resumes', error: error.message });
    }
};

/**
 * Get single resume by ID
 * @route GET /api/resume/:id
 */
const getResumeById = async (req, res) => {
    try {
        const resume = await Resume.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        res.json(resume);
    } catch (error) {
        console.error('Get resume error:', error);
        res.status(500).json({ message: 'Failed to fetch resume', error: error.message });
    }
};

/**
 * Delete resume
 * @route DELETE /api/resume/:id
 */
const deleteResume = async (req, res) => {
    try {
        const resume = await Resume.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        // Delete the file
        try {
            await fs.unlink(resume.filePath);
        } catch (fileError) {
            console.error('Error deleting file:', fileError);
        }

        // Delete the database record
        await Resume.deleteOne({ _id: req.params.id });

        res.json({ message: 'Resume deleted successfully' });
    } catch (error) {
        console.error('Delete resume error:', error);
        res.status(500).json({ message: 'Failed to delete resume', error: error.message });
    }
};

module.exports = {
    uploadResume,
    getResumes,
    getResumeById,
    deleteResume
};
