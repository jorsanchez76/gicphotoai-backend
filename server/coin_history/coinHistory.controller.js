const CoinHistory = require('./coinHistory.model');
const User = require('../user/user.model');
const CoinPlan = require('../coinPlan/coinPlan.model');
const ReportHistory = require('./reportHistory.model');
const { generateCoinHistoryReport } = require('../../util/pdfGenerator');
const fs = require('fs');
const path = require('path');

// Get coin history for a specific user with pagination
exports.getUserCoinHistory = async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        status: false,
        message: 'User ID is required'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type !== undefined ? parseInt(req.query.type) : undefined;
    const isIncome = req.query.isIncome !== undefined ? req.query.isIncome === 'true' : undefined;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    const options = {
      userId,
      page,
      limit,
      type,
      isIncome,
      startDate,
      endDate
    };

    const result = await CoinHistory.getHistoryWithPagination(options);

    return res.status(200).json({
      status: true,
      message: 'Success',
      data: result.history,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('getUserCoinHistory error:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

// Get all coin history with pagination (admin endpoint)
exports.getAllCoinHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const userId = req.query.userId;
    const type = req.query.type !== undefined ? parseInt(req.query.type) : undefined;
    const isIncome = req.query.isIncome !== undefined ? req.query.isIncome === 'true' : undefined;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    const options = {
      userId,
      page,
      limit,
      type,
      isIncome,
      startDate,
      endDate
    };

    const result = await CoinHistory.getHistoryWithPagination(options);

    return res.status(200).json({
      status: true,
      message: 'Success',
      data: result.history,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('getAllCoinHistory error:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

// Create a new coin history entry
exports.createCoinHistory = async (req, res) => {
  try {
    const {
      userId,
      coinPlanId,
      paymentGateway,
      isIncome,
      coin,
      dollar,
      type
    } = req.body;

    if (!userId || coin === undefined || type === undefined) {
      return res.status(400).json({
        status: false,
        message: 'userId, coin, and type are required fields'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found'
      });
    }

    // If coinPlanId is provided, check if it exists
    if (coinPlanId) {
      const coinPlan = await CoinPlan.findById(coinPlanId);
      if (!coinPlan) {
        return res.status(404).json({
          status: false,
          message: 'Coin plan not found'
        });
      }
    }

    const historyData = {
      userId,
      coinPlanId,
      paymentGateway: paymentGateway || 0,
      isIncome: isIncome !== undefined ? isIncome : true,
      coin: Math.abs(coin), // Ensure positive value
      dollar: dollar || 0,
      type: type || 0
    };

    const newHistory = await CoinHistory.create(historyData);

    // Update user's coin balance
    const currentCoin = user.coin || 0;
    const newCoinBalance = isIncome 
      ? currentCoin + Math.abs(coin)
      : currentCoin - Math.abs(coin);
    
    await User.update(userId, { coin: Math.max(0, newCoinBalance) });

    return res.status(201).json({
      status: true,
      message: 'Coin history created successfully',
      data: newHistory
    });
  } catch (error) {
    console.error('createCoinHistory error:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

// Get coin statistics for a user
exports.getUserCoinStats = async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        status: false,
        message: 'User ID is required'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found'
      });
    }

    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    const options = { userId, startDate, endDate };

    // Get total coins for different transaction types
    const [
      totalCoins,
      purchaseCoins,
      spentCoins,
      adminCoins,
      trainerCoins,
      createCoins,
      editCoins,
      upscalerCoins,
      generateCoins
    ] = await Promise.all([
      CoinHistory.getTotalCoins(options),
      CoinHistory.getTotalCoins({ ...options, type: 1, isIncome: true }), // Purchase
      CoinHistory.getTotalCoins({ ...options, isIncome: false }), // All spent
      CoinHistory.getTotalCoins({ ...options, type: 0 }), // Admin
      CoinHistory.getTotalCoins({ ...options, type: 2, isIncome: false }), // Trainer
      CoinHistory.getTotalCoins({ ...options, type: 3, isIncome: false }), // Create
      CoinHistory.getTotalCoins({ ...options, type: 4, isIncome: false }), // Edit
      CoinHistory.getTotalCoins({ ...options, type: 5, isIncome: false }), // Upscaler
      CoinHistory.getTotalCoins({ ...options, type: 6, isIncome: false })  // Generate
    ]);

    return res.status(200).json({
      status: true,
      message: 'Success',
      data: {
        currentBalance: user.coin,
        totalNetCoins: totalCoins,
        totalPurchased: purchaseCoins,
        totalSpent: Math.abs(spentCoins),
        breakdown: {
          admin: adminCoins,
          trainer: Math.abs(trainerCoins),
          create: Math.abs(createCoins),
          edit: Math.abs(editCoins),
          upscaler: Math.abs(upscalerCoins),
          generate: Math.abs(generateCoins)
        }
      }
    });
  } catch (error) {
    console.error('getUserCoinStats error:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

// Get coin history by transaction type
exports.getCoinHistoryByType = async (req, res) => {
  try {
    const { type } = req.query;
    
    if (type === undefined) {
      return res.status(400).json({
        status: false,
        message: 'Transaction type is required'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const userId = req.query.userId;
    const isIncome = req.query.isIncome !== undefined ? req.query.isIncome === 'true' : undefined;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    const options = {
      userId,
      page,
      limit,
      type: parseInt(type),
      isIncome,
      startDate,
      endDate
    };

    const result = await CoinHistory.getHistoryWithPagination(options);

    // Get type description
    const typeDescriptions = {
      0: 'Admin Transaction',
      1: 'Purchase',
      2: 'Model Training',
      3: 'Photo Creation',
      4: 'Photo Editing',
      5: 'Photo Upscaling',
      6: 'Generation'
    };

    return res.status(200).json({
      status: true,
      message: 'Success',
      type: typeDescriptions[parseInt(type)] || 'Unknown',
      data: result.history,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('getCoinHistoryByType error:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

// Create coin history for coin plan purchase
exports.createHistory = async (req, res) => {
  try {
    const { user_id, coin_plan_id, payment_gateway } = req.body;

    // Validate required parameters
    if (!user_id || !coin_plan_id || payment_gateway === undefined) {
      return res.json({
        status: false,
        message: 'Oops!! Invalid details!!'
      });
    }

    // Check if user exists
    const user = await User.findById(user_id);
    if (!user) {
      return res.json({
        status: false,
        message: 'User does not exist!!'
      });
    }

    // Check if coin plan exists
    const coinPlan = await CoinPlan.findById(coin_plan_id);
    if (!coinPlan) {
      return res.json({
        status: false,
        message: 'coinPlanId does not exist!!'
      });
    }

    // Calculate total coins (coin + extra_coin)
    const totalCoins = (coinPlan.coin || 0) + (coinPlan.extra_coin || 0);

    // Update user's coin balance
    const currentCoin = user.coin || 0;
    const updatedUser = await User.update(user_id, { 
      coin: currentCoin + totalCoins 
    });

    // Create coin history record
    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' '); // YYYY-MM-DD HH:MM:SS format
    
    const historyData = {
      userId: user_id,
      coinPlanId: coin_plan_id,
      coin: totalCoins,
      dollar: coinPlan.dollar || 0,
      paymentGateway: parseInt(payment_gateway),
      date: currentDate,
      type: 1, // Purchase
      isIncome: true
    };

    const newHistory = await CoinHistory.create(historyData);

    return res.json({
      status: true,
      message: 'Success!!',
      history: {
        user_id: user_id,
        coin_plan_id: coin_plan_id,
        coin: totalCoins,
        type: 1,
        payment_gateway: parseInt(payment_gateway),
        date: currentDate,
        is_income: true,
        id: newHistory.id
      }
    });

  } catch (error) {
    console.error('createHistory error:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

// Use coins (spend coins) endpoint
exports.useCoinHistory = async (req, res) => {
  try {
    const { user_id, coin, payment_gateway, type } = req.body;

    // Validate required parameters
    if (!user_id || coin === undefined || payment_gateway === undefined || type === undefined) {
      return res.json({
        status: false,
        message: 'user_id, coin, payment_gateway, and type are required parameters'
      });
    }

    // Check if user exists
    const user = await User.findById(user_id);
    if (!user) {
      return res.json({
        status: false,
        message: 'User does not exist!!'
      });
    }

    // Check if user has enough coins
    const currentCoin = user.coin || 0;
    if (currentCoin < coin) {
      return res.json({
        status: false,
        message: 'Insufficient coins!!'
      });
    }

    // Update user's coin balance (decrement)
    const newCoinBalance = currentCoin - coin;
    await User.update(user_id, { coin: newCoinBalance });

    // Create coin history record
    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' '); // YYYY-MM-DD HH:MM:SS format
    const dollar = 0.04 * coin; // Calculate dollar amount
    
    const historyData = {
      userId: user_id,
      coinPlanId: null,
      coin: coin,
      dollar: dollar,
      paymentGateway: parseInt(payment_gateway),
      date: currentDate,
      type: parseInt(type), // Use the parameter type value
      isIncome: false
    };

    const newHistory = await CoinHistory.create(historyData);

    return res.json({
      status: true,
      message: 'Success!!',
      history: {
        user_id: user_id,
        coin: coin,
        type: type,
        payment_gateway: parseInt(payment_gateway),
        date: currentDate,
        is_income: false,
        id: newHistory.id
      }
    });

  } catch (error) {
    console.error('useCoinHistory error:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

// Generate PDF report for coin history
exports.reportHistory = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.body;
    
    // Validate required parameters
    if (!userId || !startDate || !endDate) {
      return res.status(400).json({
        status: false,
        message: 'userId, startDate, and endDate are required parameters'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found'
      });
    }

    // Get coin history records with date filtering, ordered by date (oldest to newest)
    const records = await CoinHistory.findAll({
      userId,
      startDate,
      endDate
    });

    // Sort records by date (oldest to newest) for the report
    records.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Generate filename with current timestamp
    const now = new Date();
    const timestamp = now.toISOString()
      .replace(/T/, '-')
      .replace(/\..+/, '')
      .replace(/:/g, '-');
    const fileName = `${userId}_${timestamp}.pdf`;

    // Prepare report data
    const reportData = {
      userId,
      startDate,
      endDate,
      records
    };

    // Generate PDF report
    const generatedFileName = await generateCoinHistoryReport(reportData, fileName);

    // Calculate total coins for the report
    const totalCoins = records.reduce((sum, record) => {
      return sum + (record.is_income ? record.coin : -record.coin);
    }, 0);

    // Get file size
    const filePath = path.join(__dirname, '..', '..', 'storage', 'GenerativeReplicate', userId, 'reports', generatedFileName);
    const fileStats = fs.statSync(filePath);
    const fileSize = fileStats.size;

    // Format generated date
    const generatedAt = now.toISOString().slice(0, 19).replace('T', ' ');

    // Save report record to database
    const reportRecord = await ReportHistory.create({
      userId,
      fileName: generatedFileName,
      generatedAt,
      startDate,
      endDate,
      totalRecords: records.length,
      totalCoins,
      fileSize
    });

    // Return response with new structure
    return res.status(200).json({
      status: true,
      message: 'PDF report generated successfully',
      report: {
        id: reportRecord.id,
        fileName: generatedFileName,
        generatedAt,
        startDate,
        endDate,
        totalRecords: records.length,
        totalCoins,
        fileSize,
        createdAt: reportRecord.created_at
      }
    });
  } catch (error) {
    console.error('reportHistory error:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

// Get user's report history
exports.getUserReports = async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Validate required parameters
    if (!userId) {
      return res.status(400).json({
        status: false,
        message: 'userId is required parameter'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found'
      });
    }

    // Get pagination parameters
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 10;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;

    const options = {
      page,
      limit,
      startDate,
      endDate
    };

    // Get reports with pagination
    const result = await ReportHistory.getReportsWithPagination(userId, options);

    // Format response to match the expected structure
    const formattedReports = result.reports.map(report => ({
      id: report.id,
      fileName: report.file_name,
      generatedAt: report.generated_at,
      startDate: report.start_date,
      endDate: report.end_date,
      totalRecords: report.total_records,
      totalCoins: report.total_coins,
      fileSize: report.file_size,
      createdAt: report.created_at
    }));

    return res.status(200).json({
      status: true,
      message: 'Success',
      reports: formattedReports,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('getUserReports error:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

// Delete a specific report
exports.deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { userId } = req.query;
    
    // Validate required parameters
    if (!reportId || !userId) {
      return res.status(400).json({
        status: false,
        message: 'reportId and userId are required parameters'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found'
      });
    }

    // Get report record to verify ownership and get filename
    const report = await ReportHistory.findById(reportId);
    if (!report) {
      return res.status(404).json({
        status: false,
        message: 'Report not found'
      });
    }

    // Verify report belongs to user
    if (report.user_id !== userId) {
      return res.status(403).json({
        status: false,
        message: 'Access denied. Report does not belong to user'
      });
    }

    // Delete physical file
    const filePath = path.join(__dirname, '..', '..', 'storage', 'GenerativeReplicate', userId, 'reports', report.file_name);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fileError) {
      console.warn('Warning: Could not delete physical file:', fileError.message);
    }

    // Delete database record
    const deleted = await ReportHistory.deleteById(reportId);
    
    if (deleted) {
      return res.status(200).json({
        status: true,
        message: 'Report deleted successfully'
      });
    } else {
      return res.status(404).json({
        status: false,
        message: 'Report not found or already deleted'
      });
    }
  } catch (error) {
    console.error('deleteReport error:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

// Helper function to add coin transaction (for use in other controllers)
exports.addCoinTransaction = async (userId, transactionData) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const historyData = {
      userId,
      ...transactionData
    };

    const newHistory = await CoinHistory.create(historyData);

    // Update user's coin balance
    const currentCoin = user.coin || 0;
    const coinAmount = Math.abs(transactionData.coin);
    const newCoinBalance = transactionData.isIncome 
      ? currentCoin + coinAmount
      : currentCoin - coinAmount;
    
    await User.update(userId, { coin: Math.max(0, newCoinBalance) });

    return newHistory;
  } catch (error) {
    console.error('addCoinTransaction error:', error);
    throw error;
  }
};