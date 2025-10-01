const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');
const { authenticateToken } = require('../middleware/auth');

// All analysis routes require authentication
router.use(authenticateToken);

// Analyze single feedback
router.post('/projects/:projectId/feedback/:feedbackId/analyze', analysisController.analyzeSingleFeedback);

// Analyze all feedback in project (batch)
router.post('/projects/:projectId/analyze', analysisController.analyzeProjectFeedback);

// Get analysis for specific feedback
router.get('/projects/:projectId/feedback/:feedbackId/analysis', analysisController.getFeedbackAnalysis);

// Get all analyses for a project
router.get('/projects/:projectId/analyses', analysisController.getProjectAnalyses);

// Delete analysis
router.delete('/projects/:projectId/feedback/:feedbackId/analysis', analysisController.deleteAnalysis);

// Generate executive summary
router.post('/projects/:projectId/summary', analysisController.generateProjectSummary);

module.exports = router;