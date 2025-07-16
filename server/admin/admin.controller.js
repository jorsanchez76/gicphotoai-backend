const db = require('../database/sqlite.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- JWT Settings (IMPORTANT: Use environment variables in production) ---
const JWT_SECRET = process.env.GIC_JWT_SECRET || 'default_jwt_secret';
const JWT_EXPIRES_IN = '1h';

// Admin Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ status: false, message: 'Email and password are required.' });
  }

  try {
    const database = await db.openDatabase();
    const admin = await database.get('SELECT * FROM admins WHERE email = ?', [email]);

    if (!admin) {
      return res.status(401).json({ status: false, message: 'Invalid credentials.' });
    }

    const isPasswordMatch = await bcrypt.compare(password, admin.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ status: false, message: 'Invalid credentials.' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({ 
      status: true, 
      message: 'Admin login successful.', 
      token: token 
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ status: false, message: error.message });
  }
};

// Get Admin Profile
exports.getProfile = async (req, res) => {
  try {
    // req.admin is set by the auth middleware
    const { password, ...adminProfile } = req.admin;
    
    res.json({ 
      status: true, 
      message: 'Profile retrieved successfully.', 
      admin: adminProfile 
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ status: false, message: error.message });
  }
};

// Change Admin Password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  
  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ 
      status: false, 
      message: 'Current password, new password, and confirm password are required.' 
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ 
      status: false, 
      message: 'New password and confirm password do not match.' 
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ 
      status: false, 
      message: 'New password must be at least 6 characters long.' 
    });
  }

  try {
    const database = await db.openDatabase();
    
    // Get admin with password for verification
    const admin = await database.get('SELECT * FROM admins WHERE id = ?', [req.adminId]);
    
    if (!admin) {
      return res.status(404).json({ status: false, message: 'Admin not found.' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ 
        status: false, 
        message: 'Current password is incorrect.' 
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password in database
    await database.run(
      'UPDATE admins SET password = ? WHERE id = ?', 
      [hashedNewPassword, req.adminId]
    );

    res.json({ 
      status: true, 
      message: 'Password changed successfully.' 
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ status: false, message: error.message });
  }
};

// Update Admin Profile
exports.updateProfile = async (req, res) => {
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ 
      status: false, 
      message: 'Name and email are required.' 
    });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      status: false, 
      message: 'Please provide a valid email address.' 
    });
  }

  try {
    const database = await db.openDatabase();
    
    // Check if email is already taken by another admin
    const existingAdmin = await database.get(
      'SELECT id FROM admins WHERE email = ? AND id != ?', 
      [email, req.adminId]
    );
    
    if (existingAdmin) {
      return res.status(400).json({ 
        status: false, 
        message: 'Email is already in use by another admin.' 
      });
    }

    // Update admin profile
    await database.run(
      'UPDATE admins SET name = ?, email = ? WHERE id = ?', 
      [name, email, req.adminId]
    );

    // Get updated admin profile
    const updatedAdmin = await database.get(
      'SELECT id, name, email, image, created_at FROM admins WHERE id = ?', 
      [req.adminId]
    );

    res.json({ 
      status: true, 
      message: 'Profile updated successfully.', 
      admin: updatedAdmin 
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ status: false, message: error.message });
  }
};