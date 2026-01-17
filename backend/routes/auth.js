

// routes/auth.js (या जहां भी आपका router है)
const express = require('express');
const jwt = require('jsonwebtoken');
const { sheets, spreadsheetId } = require('../config/googleSheet');

const router = express.Router();

// Allowed user types
const ALLOWED_USER_TYPES = [
  'Admin',
  'Aakash Chouhan',
  'Govind Ram Nagar',
  'Ravindra Singh',
  'Ashok Sir'
];

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email और password जरूरी हैं' });
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Users!A:C', // A: Email, B: Password, C: UserType
    });

    const rows = response.data.values || [];

    if (rows.length <= 1) {
      return res.status(400).json({ error: 'कोई user नहीं मिला' });
    }

    // Case-insensitive email comparison + exact password
    const userRow = rows.slice(1).find(
      (row) =>
        row[0]?.trim().toLowerCase() === email.trim().toLowerCase() &&
        row[1]?.trim() === password.trim()
    );

    if (!userRow) {
      return res.status(401).json({ error: 'गलत email या password' });
    }

    const userType = userRow[2]?.trim();

    if (!userType || !ALLOWED_USER_TYPES.includes(userType)) {
      return res.status(403).json({ error: 'इस user type की अनुमति नहीं है' });
    }

    // JWT Token - 1 hour expiry (security के लिए)
    const token = jwt.sign(
      { email: email.trim().toLowerCase(), userType },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      token,
      userType,
      message: 'Login सफल!',
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Server error. बाद में कोशिश करें।' });
  }
});

// Protected Route - Current User Info
router.get('/user', authenticateToken, (req, res) => {
  res.json({
    email: req.user.email,
    userType: req.user.userType,
  });
});

// Middleware: JWT Verify
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token नहीं मिला' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Session expire हो गया' });
      }
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

module.exports = router;