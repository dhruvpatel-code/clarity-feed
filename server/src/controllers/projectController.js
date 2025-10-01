const pool = require('../config/database');


// Get all projects for the authenticated user
async function getAllProjects(req, res) {
  try {
    const userId = req.user.id;

    console.log(`Fetching projects for user ${userId}`);

    const result = await pool.query(
      `SELECT 
        p.id, 
        p.name, 
        p.description, 
        p.created_at, 
        p.updated_at,
        COUNT(DISTINCT f.id) as feedback_count,
        COUNT(DISTINCT a.id) as analyzed_count
       FROM projects p
       LEFT JOIN feedback f ON p.id = f.project_id
       LEFT JOIN analysis a ON f.id = a.feedback_id
       WHERE p.user_id = $1 
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [userId]
    );

    const projects = result.rows.map(project => ({
      ...project,
      feedback_count: parseInt(project.feedback_count) || 0,
      analyzed_count: parseInt(project.analyzed_count) || 0
    }));

    console.log(`Found ${projects.length} projects`);

    res.json({
      projects: projects,
      total: projects.length
    });

  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch projects',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Get single project by ID
async function getProjectById(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    console.log(`Fetching project ${id} for user ${userId}`);

    // Validate ID is a number
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }

    const result = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [parseInt(id), userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ project: result.rows[0] });

  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
}

// Create new project
// Create new project
async function createProject(req, res) {
  try {
    const userId = req.user.id;
    const { name, description } = req.body;

    console.log(`Creating project for user ${userId}:`, { name, description });

    // Validate name exists and is a string
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Project name is required and must be a string' });
    }

    // Trim and validate name is not empty
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      return res.status(400).json({ error: 'Project name cannot be empty' });
    }

    // Handle description safely
    const trimmedDescription = description && typeof description === 'string' 
      ? description.trim() 
      : null;

    const result = await pool.query(
      'INSERT INTO projects (user_id, name, description) VALUES ($1, $2, $3) RETURNING *',
      [userId, trimmedName, trimmedDescription]
    );

    console.log('Project created:', result.rows[0].id);

    res.status(201).json({
      message: 'Project created successfully',
      project: result.rows[0]
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
}

// Update project
// Update project
async function updateProject(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, description } = req.body;

    // Validate ID
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }

    // Validate name
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Project name is required and must be a string' });
    }

    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      return res.status(400).json({ error: 'Project name cannot be empty' });
    }

    const checkResult = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [parseInt(id), userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Handle description safely
    const trimmedDescription = description && typeof description === 'string' 
      ? description.trim() 
      : null;

    const result = await pool.query(
      'UPDATE projects SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4 RETURNING *',
      [trimmedName, trimmedDescription, parseInt(id), userId]
    );

    res.json({
      message: 'Project updated successfully',
      project: result.rows[0]
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
}

// Delete project
async function deleteProject(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Validate ID
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }

    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id',
      [parseInt(id), userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      message: 'Project deleted successfully',
      projectId: result.rows[0].id
    });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
}

// Get project statistics
async function getProjectStats(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    console.log(`Fetching stats for project ${id}`);

    // Validate ID
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }

    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [parseInt(id), userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const statsResult = await pool.query(
      `SELECT 
         COUNT(f.id) as total_feedback,
         COUNT(a.id) as analyzed,
         COUNT(CASE WHEN a.id IS NULL THEN 1 END) as pending
       FROM feedback f
       LEFT JOIN analysis a ON f.id = a.feedback_id
       WHERE f.project_id = $1`,
      [parseInt(id)]
    );

    const stats = statsResult.rows[0];

    res.json({
      stats: {
        totalFeedback: parseInt(stats.total_feedback) || 0,
        analyzed: parseInt(stats.analyzed) || 0,
        pending: parseInt(stats.pending) || 0
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch project statistics' });
  }
}

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats
};