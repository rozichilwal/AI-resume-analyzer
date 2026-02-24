const axios = require('axios');
const express = require('express');
const router = express.Router();
const {
    analyzeResumeById,
    reanalyzeResume,
    matchWithJob,
    getDashboard
} = require('../controllers/analysisController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.post('/analyze/:resumeId', protect, analyzeResumeById);
router.post('/reanalyze/:resumeId', protect, reanalyzeResume);
router.post('/job-match/:resumeId', protect, matchWithJob);
router.get('/dashboard', protect, getDashboard);

module.exports = router;
