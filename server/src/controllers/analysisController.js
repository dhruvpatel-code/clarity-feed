const pool = require('../config/database');
const aiService = require('../services/aiService');

// Analyze single feedback item
async function analyzeSingleFeedback(req, res) {
  try {
    const userId = req.user.id;
    const { projectId, feedbackId } = req.params;

    // Verify project belongs to user
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get feedback
    const feedbackResult = await pool.query(
      'SELECT id, original_text FROM feedback WHERE id = $1 AND project_id = $2',
      [feedbackId, projectId]
    );

    if (feedbackResult.rows.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    const feedback = feedbackResult.rows[0];

    // Check if already analyzed
    const existingAnalysis = await pool.query(
      'SELECT id FROM analysis WHERE feedback_id = $1',
      [feedbackId]
    );

    if (existingAnalysis.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Feedback already analyzed',
        message: 'This feedback has already been analyzed. Delete the existing analysis first to re-analyze.'
      });
    }

    // Analyze with Claude
    const analysis = await aiService.analyzeFeedback(feedback.original_text);

    // Store analysis
    const result = await pool.query(
      `INSERT INTO analysis 
       (feedback_id, sentiment, sentiment_score, category, themes, urgency, key_points, reasoning)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        feedbackId,
        analysis.sentiment,
        analysis.sentimentScore,
        analysis.category,
        analysis.themes,
        analysis.urgency,
        analysis.keyPoints,
        analysis.reasoning
      ]
    );

    res.status(201).json({
      message: 'Feedback analyzed successfully',
      analysis: result.rows[0]
    });

  } catch (error) {
    console.error('Analyze feedback error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze feedback',
      details: error.message 
    });
  }
}

// Analyze all feedback in a project
async function analyzeProjectFeedback(req, res) {
  try {
    const userId = req.user.id;
    const { projectId } = req.params;

    // Verify project belongs to user
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get all unanalyzed feedback
    const feedbackResult = await pool.query(
      `SELECT f.id, f.original_text 
       FROM feedback f
       LEFT JOIN analysis a ON f.id = a.feedback_id
       WHERE f.project_id = $1 AND a.id IS NULL
       ORDER BY f.created_at ASC`,
      [projectId]
    );

    if (feedbackResult.rows.length === 0) {
      return res.status(400).json({ 
        error: 'No unanalyzed feedback found',
        message: 'All feedback in this project has already been analyzed.'
      });
    }

    const feedbackToAnalyze = feedbackResult.rows;
    console.log(`Starting analysis of ${feedbackToAnalyze.length} feedback items for project ${projectId}`);

    // Analyze in batch
    const analysisResults = await aiService.batchAnalyzeFeedback(feedbackToAnalyze);

    // Store successful analyses
    const insertedAnalyses = [];
    const errors = [];

    for (const result of analysisResults) {
      if (result.success) {
        try {
          const { analysis } = result;
          const insertResult = await pool.query(
            `INSERT INTO analysis 
             (feedback_id, sentiment, sentiment_score, category, themes, urgency, key_points, reasoning)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [
              result.feedbackId,
              analysis.sentiment,
              analysis.sentimentScore,
              analysis.category,
              analysis.themes,
              analysis.urgency,
              analysis.keyPoints,
              analysis.reasoning
            ]
          );
          insertedAnalyses.push(insertResult.rows[0]);
        } catch (err) {
          console.error(`Failed to store analysis for feedback ${result.feedbackId}:`, err);
          errors.push(`Failed to store analysis for feedback ${result.feedbackId}`);
        }
      } else {
        errors.push(`Failed to analyze feedback ${result.feedbackId}: ${result.error}`);
      }
    }

    res.status(201).json({
      message: 'Batch analysis complete',
      analyzed: insertedAnalyses.length,
      total: feedbackToAnalyze.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Batch analyze error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze project feedback',
      details: error.message 
    });
  }
}

// Get analysis for specific feedback
async function getFeedbackAnalysis(req, res) {
  try {
    const userId = req.user.id;
    const { projectId, feedbackId } = req.params;

    // Verify project belongs to user
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get analysis
    const result = await pool.query(
      `SELECT a.* 
       FROM analysis a
       JOIN feedback f ON a.feedback_id = f.id
       WHERE a.feedback_id = $1 AND f.project_id = $2`,
      [feedbackId, projectId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json({ analysis: result.rows[0] });

  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
}

// Get all analyses for a project
async function getProjectAnalyses(req, res) {
  try {
    const userId = req.user.id;
    const { projectId } = req.params;

    // Verify project belongs to user
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get all analyses with feedback
    const result = await pool.query(
      `SELECT 
         a.*,
         f.original_text,
         f.customer_name,
         f.customer_email,
         f.source,
         f.date_received,
         f.created_at as feedback_created_at
       FROM analysis a
       JOIN feedback f ON a.feedback_id = f.id
       WHERE f.project_id = $1
       ORDER BY f.created_at DESC`,
      [projectId]
    );

    // Get summary statistics
    const statsResult = await pool.query(
      `SELECT 
         COUNT(*) as total,
         COUNT(CASE WHEN a.sentiment = 'positive' THEN 1 END) as positive,
         COUNT(CASE WHEN a.sentiment = 'negative' THEN 1 END) as negative,
         COUNT(CASE WHEN a.sentiment = 'neutral' THEN 1 END) as neutral,
         COUNT(CASE WHEN a.sentiment = 'mixed' THEN 1 END) as mixed,
         COUNT(CASE WHEN a.urgency = 'critical' THEN 1 END) as critical,
         COUNT(CASE WHEN a.urgency = 'high' THEN 1 END) as high_urgency,
         AVG(a.sentiment_score) as avg_sentiment_score
       FROM analysis a
       JOIN feedback f ON a.feedback_id = f.id
       WHERE f.project_id = $1`,
      [projectId]
    );

    const stats = statsResult.rows[0];

    res.json({
      analyses: result.rows,
      total: result.rows.length,
      stats: {
        total: parseInt(stats.total),
        sentiment: {
          positive: parseInt(stats.positive),
          negative: parseInt(stats.negative),
          neutral: parseInt(stats.neutral),
          mixed: parseInt(stats.mixed)
        },
        urgency: {
          critical: parseInt(stats.critical),
          high: parseInt(stats.high_urgency)
        },
        avgSentimentScore: parseFloat(stats.avg_sentiment_score) || 0
      }
    });

  } catch (error) {
    console.error('Get project analyses error:', error);
    res.status(500).json({ error: 'Failed to fetch analyses' });
  }
}

// Delete analysis
async function deleteAnalysis(req, res) {
  try {
    const userId = req.user.id;
    const { projectId, feedbackId } = req.params;

    // Verify project belongs to user
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Delete analysis
    const result = await pool.query(
      `DELETE FROM analysis 
       WHERE feedback_id = $1 
       AND feedback_id IN (SELECT id FROM feedback WHERE project_id = $2)
       RETURNING id`,
      [feedbackId, projectId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json({
      message: 'Analysis deleted successfully',
      analysisId: result.rows[0].id
    });

  } catch (error) {
    console.error('Delete analysis error:', error);
    res.status(500).json({ error: 'Failed to delete analysis' });
  }
}

// Generate executive summary for project
async function generateProjectSummary(req, res) {
  try {
    const userId = req.user.id;
    const { projectId } = req.params;

    // Verify project belongs to user
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get all analyses
    const analysesResult = await pool.query(
      `SELECT 
         a.*,
         f.original_text
       FROM analysis a
       JOIN feedback f ON a.feedback_id = f.id
       WHERE f.project_id = $1`,
      [projectId]
    );

    if (analysesResult.rows.length === 0) {
      return res.status(400).json({ 
        error: 'No analyzed feedback found',
        message: 'Analyze some feedback first before generating a summary.'
      });
    }

    console.log(`Generating executive summary for ${analysesResult.rows.length} feedback items...`);

    // Generate summary with AI
    const summary = await aiService.generateExecutiveSummary(analysesResult.rows);

    res.json({
      message: 'Executive summary generated successfully',
      summary
    });

  } catch (error) {
    console.error('Generate summary error:', error);
    res.status(500).json({ 
      error: 'Failed to generate executive summary',
      details: error.message 
    });
  }
}

module.exports = {
  analyzeSingleFeedback,
  analyzeProjectFeedback,
  getFeedbackAnalysis,
  getProjectAnalyses,
  deleteAnalysis,
  generateProjectSummary
};