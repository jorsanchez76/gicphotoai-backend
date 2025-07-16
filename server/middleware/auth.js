const jwt = require('jsonwebtoken');
const db = require('../database/sqlite.js');

// JWT Settings (same as admin.controller.js)
const JWT_SECRET = process.env.GIC_JWT_SECRET || 'default_jwt_secret';

// Middleware to verify JWT token and authenticate admin
exports.authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        status: false, 
        message: 'Access denied. No token provided or invalid format.' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get admin from database to ensure user still exists
    const database = await db.openDatabase();
    const admin = await database.get('SELECT id, name, email, image, created_at FROM admins WHERE id = ?', [decoded.id]);
    
    if (!admin) {
      return res.status(401).json({ 
        status: false, 
        message: 'Access denied. Admin not found.' 
      });
    }

    // Add admin info to request object
    req.admin = admin;
    req.adminId = admin.id;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        status: false, 
        message: 'Access denied. Invalid token.' 
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        status: false, 
        message: 'Access denied. Token expired.' 
      });
    } else {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ 
        status: false, 
        message: 'Internal server error during authentication.' 
      });
    }
  }
};