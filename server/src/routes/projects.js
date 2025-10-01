const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticateToken } = require('../middleware/auth');

// All project routes require authentication
router.use(authenticateToken);

// Get all projects for user
router.get('/', projectController.getAllProjects);

// Get single project
router.get('/:id', projectController.getProjectById);

// Create new project
router.post('/', projectController.createProject);

// Update project
router.put('/:id', projectController.updateProject);

// Delete project
router.delete('/:id', projectController.deleteProject);

// Get project statistics
router.get('/:id/stats', projectController.getProjectStats);

module.exports = router;