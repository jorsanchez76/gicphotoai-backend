const express = require('express');
const router = express.Router();
const UserFlagsController = require('./user_flags.controller');

// Middleware for admin authentication (assuming you have one)
// const adminMiddleware = require('../middleware/admin.middleware');

// Get all user flags
router.get('/', UserFlagsController.index);

// Create a new user flag
router.post('/', UserFlagsController.store);

// Get a specific user flag
router.get('/:id', UserFlagsController.show);

// Update a user flag
router.put('/:id', UserFlagsController.update);

// Delete a user flag
router.delete('/:id', UserFlagsController.destroy);

module.exports = router;