const express = require('express');
const router = express.Router();

const CoinHistoryController = require('./coinHistory.controller');
const checkAccessWithSecretKey = require('../../checkAccess');

// Get coin history for a specific user
router.get(
  '/user',
  checkAccessWithSecretKey(),
  CoinHistoryController.getUserCoinHistory
);

// Get all coin history (admin endpoint)
router.get(
  '/all',
  checkAccessWithSecretKey(),
  CoinHistoryController.getAllCoinHistory
);

// Create a new coin history entry
router.post(
  '/create',
  checkAccessWithSecretKey(),
  CoinHistoryController.createCoinHistory
);

// Get coin statistics for a user
router.get(
  '/user/stats',
  checkAccessWithSecretKey(),
  CoinHistoryController.getUserCoinStats
);

// Get coin history by transaction type
router.get(
  '/type',
  checkAccessWithSecretKey(),
  CoinHistoryController.getCoinHistoryByType
);

// Create coin history for coin plan purchase
router.post(
  '/createHistory',
  checkAccessWithSecretKey(),
  CoinHistoryController.createHistory
);

// Use coins (spend coins) endpoint
router.post(
  '/useCoinHistory',
  checkAccessWithSecretKey(),
  CoinHistoryController.useCoinHistory
);

// Generate PDF report for coin history
router.post(
  '/addReport',
  checkAccessWithSecretKey(),
  CoinHistoryController.reportHistory
);

// Get user's report history
router.post(
  '/reports',
  checkAccessWithSecretKey(),
  CoinHistoryController.getUserReports
);

// Delete a specific report
router.delete(
  '/reports/:reportId',
  checkAccessWithSecretKey(),
  CoinHistoryController.deleteReport
);

module.exports = router;