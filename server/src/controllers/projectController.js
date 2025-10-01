const pool = require('../config/database');
const { sanitizeInput } = require('../utils/validators');

// Get all projects for the authenticated user
async function getAllProjects(req, res) {
  try {
    const userId = req.user.id;

    // Get projects with feedback counts
    const result = await pool.query(
      `SELECT 
        p.id, 
        p.name, 
        p.description, 
        p.created_at, 
        p.updated_at,
        COUNT(f.id) as feedback_count
       FROM projects p
       LEFT JOIN feedback f ON p.id = f.project_id
       WHERE p.user_id = $1 
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [userId]
    );

    // Convert feedback_count from string to number
    const projects = result.rows.map(project => ({
      ...project,
      feedback_count: parseInt(project.feedback_count)
    }));

    res.json({
      projects: projects,
      total: projects.length
    });

  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
}

// Get single project by ID
async function getProjectById(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, name, description, created_at, updated_at 
       FROM projects 
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
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
async function createProject(req, res) {
  try {
    const userId = req.user.id;
    const { name, description } = req.body;

    // Validate input
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    if (name.length > 255) {
      return res.status(400).json({ error: 'Project name must be less than 255 characters' });
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedDescription = description ? sanitizeInput(description) : null;

    // Insert project
    const result = await pool.query(
      `INSERT INTO projects (user_id, name, description) 
       VALUES ($1, $2, $3) 
       RETURNING id, name, description, created_at, updated_at`,
      [userId, sanitizedName, sanitizedDescription]
    );

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
async function updateProject(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, description } = req.body;

    // Check if project exists and belongs to user
    const checkResult = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Validate input
    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Project name cannot be empty' });
      }
      if (name.length > 255) {
        return res.status(400).json({ error: 'Project name must be less than 255 characters' });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(sanitizeInput(name));
      paramCount++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(description ? sanitizeInput(description) : null);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id, userId);

    const result = await pool.query(
      `UPDATE projects 
       SET ${updates.join(', ')} 
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
       RETURNING id, name, description, created_at, updated_at`,
      values
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

    // Check if project exists and belongs to user
    const checkResult = await pool.query(
      'SELECT id, name FROM projects WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Delete project (will cascade delete related feedback)
    await pool.query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    res.json({
      message: 'Project deleted successfully',
      projectId: parseInt(id)
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

    // Verify project belongs to user
    const projectResult = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get feedback count
    const feedbackResult = await pool.query(
      'SELECT COUNT(*) as total FROM feedback WHERE project_id = $1',
      [id]
    );

    // For now, all feedback is pending (will be updated when analysis is added)
    const stats = {
      totalFeedback: parseInt(feedbackResult.rows[0].total),
      analyzed: 0,
      pending: parseInt(feedbackResult.rows[0].total)
    };

    res.json({ stats });

  } catch (error) {
    console.error('Get project stats error:', error);
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