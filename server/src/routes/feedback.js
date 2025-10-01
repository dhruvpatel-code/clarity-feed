const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authenticateToken } = require('../middleware/auth');

// All feedback routes require authentication
router.use(authenticateToken);

// Get all feedback for a project
router.get('/projects/:projectId/feedback', feedbackController.getAllFeedback);

// Get single feedback item
router.get('/projects/:projectId/feedback/:feedbackId', feedbackController.getFeedbackById);

// Add feedback manually
router.post('/projects/:projectId/feedback', feedbackController.createFeedback);

// Upload CSV
router.post('/projects/:projectId/feedback/upload-csv', feedbackController.uploadCSV);

// Delete single feedback
router.delete('/projects/:projectId/feedback/:feedbackId', feedbackController.deleteFeedback);

// Delete all feedback in project
router.delete('/projects/:projectId/feedback', feedbackController.deleteAllFeedback);

module.exports = router;