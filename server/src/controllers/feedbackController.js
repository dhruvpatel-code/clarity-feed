const pool = require('../config/database');
const { sanitizeInput } = require('../utils/validators');
const Papa = require('papaparse');

// Get all feedback for a project
async function getAllFeedback(req, res) {
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

    // Get all feedback
    const result = await pool.query(
      `SELECT id, original_text, source, customer_name, customer_email, 
              date_received, created_at 
       FROM feedback 
       WHERE project_id = $1 
       ORDER BY created_at DESC`,
      [projectId]
    );

    res.json({
      feedback: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
}

// Get single feedback item
async function getFeedbackById(req, res) {
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
    const result = await pool.query(
      `SELECT id, original_text, source, customer_name, customer_email, 
              date_received, created_at 
       FROM feedback 
       WHERE id = $1 AND project_id = $2`,
      [feedbackId, projectId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json({ feedback: result.rows[0] });

  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
}

// Add single feedback manually
async function createFeedback(req, res) {
  try {
    const userId = req.user.id;
    const { projectId } = req.params;
    const { text, customerName, customerEmail, dateReceived } = req.body;

    // Validate input
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Feedback text is required' });
    }

    if (text.length > 10000) {
      return res.status(400).json({ error: 'Feedback text is too long (max 10,000 characters)' });
    }

    // Verify project belongs to user
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Sanitize inputs
    const sanitizedText = sanitizeInput(text);
    const sanitizedName = customerName ? sanitizeInput(customerName) : null;
    const sanitizedEmail = customerEmail ? sanitizeInput(customerEmail).toLowerCase() : null;

    // Validate email if provided
    if (sanitizedEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitizedEmail)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }

    // Parse date if provided
    let parsedDate = null;
    if (dateReceived) {
      parsedDate = new Date(dateReceived);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
    }

    // Insert feedback
    const result = await pool.query(
      `INSERT INTO feedback 
       (project_id, original_text, source, customer_name, customer_email, date_received) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, original_text, source, customer_name, customer_email, date_received, created_at`,
      [projectId, sanitizedText, 'manual', sanitizedName, sanitizedEmail, parsedDate]
    );

    res.status(201).json({
      message: 'Feedback added successfully',
      feedback: result.rows[0]
    });

  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({ error: 'Failed to add feedback' });
  }
}

// Upload CSV feedback
async function uploadCSV(req, res) {
  try {
    const userId = req.user.id;
    const { projectId } = req.params;
    const { csvData } = req.body;

    // Validate input
    if (!csvData || csvData.trim().length === 0) {
      return res.status(400).json({ error: 'CSV data is required' });
    }

    // Verify project belongs to user
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Parse CSV
    const parseResult = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
      dynamicTyping: true
    });

    if (parseResult.errors.length > 0) {
      return res.status(400).json({ 
        error: 'CSV parsing failed', 
        details: parseResult.errors 
      });
    }

    const rows = parseResult.data;

    if (rows.length === 0) {
      return res.status(400).json({ error: 'CSV file is empty' });
    }

    // Validate CSV has required columns
    const firstRow = rows[0];
    const possibleTextColumns = ['text', 'feedback', 'comment', 'review', 'message', 'description'];
    
    let textColumn = null;
    for (const col of possibleTextColumns) {
      if (firstRow.hasOwnProperty(col)) {
        textColumn = col;
        break;
      }
    }

    if (!textColumn) {
      return res.status(400).json({ 
        error: 'CSV must contain a text column',
        hint: 'Column should be named: text, feedback, comment, review, or message',
        foundColumns: Object.keys(firstRow)
      });
    }

    // Prepare feedback items
    const feedbackItems = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const text = row[textColumn];

      // Skip if no text
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        errors.push(`Row ${i + 1}: Missing or empty text field`);
        continue;
      }

      // Check length
      if (text.length > 10000) {
        errors.push(`Row ${i + 1}: Text too long (max 10,000 characters)`);
        continue;
      }

      // Extract optional fields
      const customerName = row.customer_name || row.name || row.customer || null;
      const customerEmail = row.customer_email || row.email || null;
      const dateReceived = row.date_received || row.date || row.received_date || null;

      // Parse date if present
      let parsedDate = null;
      if (dateReceived) {
        parsedDate = new Date(dateReceived);
        if (isNaN(parsedDate.getTime())) {
          parsedDate = null;
        }
      }

      feedbackItems.push({
        text: sanitizeInput(text),
        customerName: customerName ? sanitizeInput(String(customerName)) : null,
        customerEmail: customerEmail ? sanitizeInput(String(customerEmail).toLowerCase()) : null,
        dateReceived: parsedDate
      });
    }

    if (feedbackItems.length === 0) {
      return res.status(400).json({ 
        error: 'No valid feedback items found',
        errors 
      });
    }

    // Insert all feedback items
    const insertedItems = [];
    
    for (const item of feedbackItems) {
      try {
        const result = await pool.query(
          `INSERT INTO feedback 
           (project_id, original_text, source, customer_name, customer_email, date_received) 
           VALUES ($1, $2, $3, $4, $5, $6) 
           RETURNING id, original_text, source, customer_name, customer_email, date_received, created_at`,
          [projectId, item.text, 'csv', item.customerName, item.customerEmail, item.dateReceived]
        );
        insertedItems.push(result.rows[0]);
      } catch (err) {
        console.error('Insert error:', err);
        errors.push(`Failed to insert item: ${item.text.substring(0, 50)}...`);
      }
    }

    res.status(201).json({
      message: 'CSV uploaded successfully',
      inserted: insertedItems.length,
      total: rows.length,
      feedback: insertedItems,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Upload CSV error:', error);
    res.status(500).json({ error: 'Failed to upload CSV' });
  }
}

// Delete feedback
async function deleteFeedback(req, res) {
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

    // Delete feedback
    const result = await pool.query(
      'DELETE FROM feedback WHERE id = $1 AND project_id = $2 RETURNING id',
      [feedbackId, projectId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json({
      message: 'Feedback deleted successfully',
      feedbackId: parseInt(feedbackId)
    });

  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
}

// Delete all feedback in a project
async function deleteAllFeedback(req, res) {
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

    // Delete all feedback
    const result = await pool.query(
      'DELETE FROM feedback WHERE project_id = $1 RETURNING id',
      [projectId]
    );

    res.json({
      message: 'All feedback deleted successfully',
      count: result.rows.length
    });

  } catch (error) {
    console.error('Delete all feedback error:', error);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
}

module.exports = {
  getAllFeedback,
  getFeedbackById,
  createFeedback,
  uploadCSV,
  deleteFeedback,
  deleteAllFeedback
};