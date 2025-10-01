const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticateToken } = require('../middleware/auth');

// All project routes require authentication
router.use(authenticateToken);

// IMPORTANT: Specific routes MUST come before parameterized routes
// Get all projects (must come before /:id)
router.get('/projects', projectController.getAllProjects);

// Create new project
router.post('/projects', projectController.createProject);

// Get project stats (must come before /:id)
router.get('/projects/:id/stats', projectController.getProjectStats);

// Get single project by ID
router.get('/projects/:id', projectController.getProjectById);

// Update project
router.put('/projects/:id', projectController.updateProject);

// Delete project
router.delete('/projects/:id', projectController.deleteProject);

module.exports = router;