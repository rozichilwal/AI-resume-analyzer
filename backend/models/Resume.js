const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    originalText: {
        type: String,
        required: true
    },
    jobRole: {
        type: String,
        enum: ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Scientist', 'DevOps Engineer', 'Product Manager', 'UI/UX Designer', 'Mobile Developer', 'General'],
        default: 'General'
    },
    analysis: {
        atsScore: {
            type: Number,
            min: 0,
            max: 100
        },
        skills: [String],
        missingSkills: [String],
        grammarIssues: [String],
        suggestions: [String],
        professionalSummary: String,
        formatScore: Number,
        keywordScore: Number,
        skillsScore: Number,
        experienceScore: Number,
        grammarScore: Number
    },
    jobMatchResults: [{
        jobDescription: String,
        matchPercentage: Number,
        matchedKeywords: [String],
        missingKeywords: [String],
        recommendations: [String],
        analyzedAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
resumeSchema.pre('save', async function () {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Resume', resumeSchema);
