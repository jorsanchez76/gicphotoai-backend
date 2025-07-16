const express = require('express');
const router = express.Router();
const ConfigController = require('./config.controller');

// Endpoint to generate the encrypted config file
router.get('/generate', ConfigController.generateConfig);

module.exports = router;