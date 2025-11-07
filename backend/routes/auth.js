const express = require('express');
const jwt = require('jsonwebtoken');
const { sheets, spreadsheetId } = require('../config/googleSheet');

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Users!A:C',
    });

    const rows = response.data.values || [];
    console.log('Google Sheet rows:', rows); // Log all rows

    if (rows.length === 0) {
      return res.status(400).json({ error: 'No users found in the sheet' });
    }

    const user = rows.slice(1).find((row) => row[0] === email && row[1] === password);
    console.log('Matched user:', user); // Log matched user

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userType = user[2]?.trim(); // Trim to remove whitespace
    console.log('userType:', userType); // Log userType

    if (!['Admin', 'Anish', 'Aakash Chouhan', 'Ravi Rajak','Anjali Malviya','Neha Masani','Gourav Singh','Somesh Chadhar'].includes(userType)) {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    const token = jwt.sign({ email, userType }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    return res.json({ token, userType });
  } catch (error) {
    console.error('Error in login:', error.message, error.stack);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Protected route example
router.get('/user', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ email: decoded.email });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;