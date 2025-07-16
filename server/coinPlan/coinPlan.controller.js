const CoinPlan = require('./coinPlan.model');
const User = require('../user/user.model');

//get all Coin Plans
exports.index = async (req, res) => {
  try {
    const coinPlans = await CoinPlan.findAll({ 
      orderBy: 'coin',
      order: 'ASC'
    });

    return res.status(200).json({
      status: true,
      message: "Success!!",
      coinPlans,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//get active Coin Plan
exports.appPlan = async (req, res) => {
  try {
    const coinPlan = await CoinPlan.findAll({ 
      where: { isActive: true },
      orderBy: 'coin',
      order: 'ASC'
    });

    return res.status(200).json({
      status: true,
      message: "Success!!",
      coinPlan,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//create Coin Plan
exports.store = async (req, res) => {
  try {
    if (
      !req.body.dollar ||
      !req.body.productKey ||
      req.body.platformType < 0 ||
      !req.body.coin
    ) {
      return res
        .status(200)
        .json({ status: false, message: "Invalid Details!!" });
    }

    const coinPlan = await CoinPlan.create({
      coin: parseInt(req.body.coin),
      extraCoin: parseInt(req.body.extraCoin) || 0,
      dollar: parseFloat(req.body.dollar),
      productKey: req.body.productKey,
      tag: req.body.tag,
      platformType: parseInt(req.body.platformType),
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    });

    return res.status(200).json({
      status: true,
      message: "Success!!",
      coinPlan,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//update Coin Plan
exports.update = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(200)
        .json({ status: false, message: "coin planId is required!!" });
    }

    const coinPlan = await CoinPlan.findById(req.params.id);

    if (!coinPlan) {
      return res
        .status(200)
        .json({ status: false, message: "plan does not exist!!" });
    }

    const updateData = {};
    if (req.body.coin !== undefined) updateData.coin = parseInt(req.body.coin);
    if (req.body.extraCoin !== undefined) updateData.extraCoin = parseInt(req.body.extraCoin);
    if (req.body.dollar !== undefined) updateData.dollar = parseFloat(req.body.dollar);
    if (req.body.tag !== undefined) updateData.tag = req.body.tag;
    if (req.body.productKey !== undefined) updateData.productKey = req.body.productKey;
    if (req.body.platformType !== undefined) updateData.platformType = parseInt(req.body.platformType);
    if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;

    const updatedCoinPlan = await CoinPlan.update(req.params.id, updateData);

    return res.status(200).json({
      status: true,
      message: "Success!!",
      coinPlan: updatedCoinPlan,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

//delete Coin Plan
exports.destroy = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(200)
        .json({ status: false, message: "coin planId is required!!" });
    }

    const coinPlan = await CoinPlan.findById(req.params.id);

    if (!coinPlan) {
      return res
        .status(200)
        .json({ status: false, message: "Plan does not exists!!" });
    }

    await CoinPlan.delete(req.params.id);

    return res
      .status(200)
      .json({ status: true, message: "data deleted successfully!!" });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

//create coinHistory for purchase
exports.createHistory = async (req, res) => {
  try {
    if (req.body.userId && req.body.coinPlanId && req.body.paymentGateway) {
      const user = await User.findById(req.body.userId);

      if (!user) {
        return res.json({
          status: false,
          message: "User does not exist!!",
        });
      }

      const coinPlan = await CoinPlan.findById(req.body.coinPlanId);

      if (!coinPlan) {
        return res.json({
          status: false,
          message: "coinPlanId does not exist!!",
        });
      }

      // Update user coins
      const totalCoins = coinPlan.coin + coinPlan.extra_coin;
      const updatedUser = await User.update(user.id, {
        coin: (user.coin || 0) + totalCoins,
        purchasedCoin: (user.purchasedCoin || 0) + totalCoins,
        isCoinPlan: true,
        planStartDate: new Date().toISOString(),
        coinPlanId: coinPlan.id
      });

      // Create history record (simplified version - you may need to create a History model)
      const historyData = {
        userId: user.id,
        coinPlanId: coinPlan.id,
        coin: totalCoins,
        type: 2, // Purchase type
        paymentGateway: req.body.paymentGateway, // 1.GooglePlay 2.RazorPay 3.Stripe
        date: new Date().toISOString()
      };

      return res.json({
        status: true,
        message: "Success!!",
        history: historyData,
        user: updatedUser
      });
    } else {
      return res.json({
        status: false,
        message: "Oops!! Invalid details!!",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};