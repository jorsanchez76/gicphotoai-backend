const express = require('express');
const router = express.Router();
const AdminController = require('./admin.controller');
const { authenticateAdmin } = require('../middleware/auth');

// Admin login (public route)
router.post('/login', AdminController.login);

// Protected admin routes (require authentication)
router.get('/profile', authenticateAdmin, AdminController.getProfile);
router.put('/change-password', authenticateAdmin, AdminController.changePassword);
router.put('/profile', authenticateAdmin, AdminController.updateProfile);

module.exports = router;