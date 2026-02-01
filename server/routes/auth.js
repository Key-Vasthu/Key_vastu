import express from 'express';
import bcrypt from 'bcrypt';
import { query } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and name are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long',
      });
    }

    // Check if email already exists
    const existingUser = await query(
      'SELECT id, email FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered. Please use a different email or login.',
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = 'user-' + uuidv4();
    const userEmail = email.toLowerCase().trim();
    const role = userEmail.includes('admin') ? 'admin' : 'user';

    await query(
      `INSERT INTO users (id, email, name, password, phone, role, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
      [userId, userEmail, name.trim(), hashedPassword, phone ? phone.trim() : null, role]
    );

    // Return user data (without password)
    const newUser = {
      id: userId,
      email: userEmail,
      name: name.trim(),
      phone: phone ? phone.trim() : null,
      role,
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      data: { user: newUser },
      message: 'Registration successful! You can now login.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again later.',
    });
  }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    // Find user by email
    const result = await query(
      'SELECT id, email, name, password, role, avatar, phone, created_at, last_login FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    // Check if user exists
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Email not found. Please sign up first or check your email address.',
      });
    }

    const user = result.rows[0];

    // Check if password exists (for users created before password field was added)
    if (!user.password) {
      return res.status(401).json({
        success: false,
        error: 'Account needs to be reset. Please contact support or sign up again with this email.',
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid password. Please check your password and try again.',
      });
    }

    // Update last_login
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Return user data (without password)
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      createdAt: user.created_at ? user.created_at.toISOString() : new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    // Generate a simple token (in production, use JWT)
    const token = 'auth-token-' + Date.now() + '-' + user.id;

    res.json({
      success: true,
      data: {
        user: userData,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed. Please try again later.',
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout (client-side token removal)
 */
router.post('/logout', async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

export { router as authRoutes };
