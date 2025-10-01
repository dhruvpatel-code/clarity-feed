const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { isValidEmail, isValidPassword, sanitizeInput } = require('../utils/validators');

// Generate JWT token
function generateToken(userId, email) {
  return jwt.sign(
    { id: userId, email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );
}

// Register new user
async function register(req, res) {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const sanitizedName = name ? sanitizeInput(name) : null;

    // Validate email format
    if (!isValidEmail(sanitizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password strength
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [sanitizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user into database
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, name, created_at`,
      [sanitizedEmail, passwordHash, sanitizedName]
    );

    const user = result.rows[0];

    // Generate token
    const token = generateToken(user.id, user.email);

    // Return user data and token
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
}

// Login user
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Sanitize email
    const sanitizedEmail = sanitizeInput(email).toLowerCase();

    // Find user by email
    const result = await pool.query(
      'SELECT id, email, password_hash, name FROM users WHERE email = $1',
      [sanitizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user.id, user.email);

    // Return user data and token
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
}

// Get current user profile
async function getProfile(req, res) {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT id, email, name, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
}

module.exports = {
  register,
  login,
  getProfile
};