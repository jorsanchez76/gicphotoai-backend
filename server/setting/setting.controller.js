const Setting = require("./setting.model");

//create setting
exports.store = async (req, res) => {
  try {
    const setting = await Setting.create();

    return res.status(200).json({
      status: true,
      message: "Success!!",
      setting,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//get setting
exports.getSetting = async (req, res) => {
  try {
    const dbSetting = await Setting.findOne();
    
    if (!dbSetting) {
      return res.status(200).json({
        status: false,
        message: "Settings not found",
      });
    }

    // Map database keys to original camelCase format and convert boolean fields
    const setting = {
      _id: dbSetting.id,
      agoraKey: dbSetting.agora_key,
      agoraCertificate: dbSetting.agora_certificate,
      privacyPolicyLink: dbSetting.privacy_policy_link,
      privacyPolicyText: dbSetting.privacy_policy_text,
      termAndCondition: dbSetting.term_and_condition,
      googlePlayEmail: dbSetting.google_play_email,
      googlePlayKey: dbSetting.google_play_key,
      googlePlaySwitch: Boolean(dbSetting.google_play_switch),
      stripeSwitch: Boolean(dbSetting.stripe_switch),
      stripePublishableKey: dbSetting.stripe_publishable_key,
      stripeSecretKey: dbSetting.stripe_secret_key,
      isAppActive: Boolean(dbSetting.is_app_active),
      welcomeMessage: dbSetting.welcome_message,
      razorPayId: dbSetting.razor_pay_id,
      razorPaySwitch: Boolean(dbSetting.razor_pay_switch),
      razorSecretKey: dbSetting.razor_secret_key,
      chargeForRandomCall: dbSetting.charge_for_random_call,
      chargeForPrivateCall: dbSetting.charge_for_private_call,
      coinPerDollar: dbSetting.coin_per_dollar,
      coinCharge: dbSetting.coin_charge,
      paymentGateway: dbSetting.payment_gateway,
      redirectAppUrl: dbSetting.redirect_app_url,
      redirectMessage: dbSetting.redirect_message,
      withdrawLimit: dbSetting.withdraw_limit,
      // Keep other fields as they are
      link: dbSetting.link,
      isFake: Boolean(dbSetting.is_fake),
      isData: Boolean(dbSetting.is_data),
      createdAt: dbSetting.created_at,
      updatedAt: dbSetting.updated_at
    };

    return res.status(200).json({
      status: true,
      message: "Success!!",
      setting,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//update the setting data
exports.update = async (req, res) => {
  try {
    const setting = await Setting.findOne();

    if (!setting)
      return res
        .status(200)
        .json({ status: false, message: "Setting data does not Exist!" });

    // Accept both old snake_case keys and new camelCase keys for backward compatibility
    const updateData = {
      coinPerDollar: req.body.coinPerDollar || req.body.coin_per_dollar,
      agoraKey: req.body.agoraKey || req.body.agora_key,
      agoraCertificate: req.body.agoraCertificate || req.body.agora_certificate,
      privacyPolicyLink: req.body.privacyPolicyLink || req.body.privacy_policy_link,
      privacyPolicyText: req.body.privacyPolicyText || req.body.privacy_policy_text,
      termAndCondition: req.body.termAndCondition || req.body.term_and_condition,
      googlePlayEmail: req.body.googlePlayEmail || req.body.google_play_email,
      googlePlayKey: req.body.googlePlayKey || req.body.google_play_key,
      googlePlaySwitch: req.body.googlePlaySwitch || req.body.google_play_switch,
      stripeSwitch: req.body.stripeSwitch || req.body.stripe_switch,
      stripePublishableKey: req.body.stripePublishableKey || req.body.stripe_publishable_key,
      stripeSecretKey: req.body.stripeSecretKey || req.body.stripe_secret_key,
      isAppActive: req.body.isAppActive || req.body.is_app_active,
      welcomeMessage: req.body.welcomeMessage || req.body.welcome_message,
      razorPayId: req.body.razorPayId || req.body.razor_pay_id,
      razorPaySwitch: req.body.razorPaySwitch || req.body.razor_pay_switch,
      razorSecretKey: req.body.razorSecretKey || req.body.razor_secret_key,
      chargeForRandomCall: req.body.chargeForRandomCall || req.body.charge_for_random_call,
      chargeForPrivateCall: req.body.chargeForPrivateCall || req.body.charge_for_private_call,
      coinCharge: req.body.coinCharge || req.body.coin_charge,
      paymentGateway: req.body.paymentGateway || req.body.payment_gateway,
      redirectAppUrl: req.body.redirectAppUrl || req.body.redirect_app_url,
      redirectMessage: req.body.redirectMessage || req.body.redirect_message,
      withdrawLimit: req.body.withdrawLimit || req.body.withdraw_limit,
      link: req.body.link,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const dbUpdatedSetting = await Setting.update(setting.id, updateData);

    // Map database keys to original camelCase format and convert boolean fields for response
    const updatedSetting = {
      _id: dbUpdatedSetting.id,
      agoraKey: dbUpdatedSetting.agora_key,
      agoraCertificate: dbUpdatedSetting.agora_certificate,
      privacyPolicyLink: dbUpdatedSetting.privacy_policy_link,
      privacyPolicyText: dbUpdatedSetting.privacy_policy_text,
      termAndCondition: dbUpdatedSetting.term_and_condition,
      googlePlayEmail: dbUpdatedSetting.google_play_email,
      googlePlayKey: dbUpdatedSetting.google_play_key,
      googlePlaySwitch: Boolean(dbUpdatedSetting.google_play_switch),
      stripeSwitch: Boolean(dbUpdatedSetting.stripe_switch),
      stripePublishableKey: dbUpdatedSetting.stripe_publishable_key,
      stripeSecretKey: dbUpdatedSetting.stripe_secret_key,
      isAppActive: Boolean(dbUpdatedSetting.is_app_active),
      welcomeMessage: dbUpdatedSetting.welcome_message,
      razorPayId: dbUpdatedSetting.razor_pay_id,
      razorPaySwitch: Boolean(dbUpdatedSetting.razor_pay_switch),
      razorSecretKey: dbUpdatedSetting.razor_secret_key,
      chargeForRandomCall: dbUpdatedSetting.charge_for_random_call,
      chargeForPrivateCall: dbUpdatedSetting.charge_for_private_call,
      coinPerDollar: dbUpdatedSetting.coin_per_dollar,
      coinCharge: dbUpdatedSetting.coin_charge,
      paymentGateway: dbUpdatedSetting.payment_gateway,
      redirectAppUrl: dbUpdatedSetting.redirect_app_url,
      redirectMessage: dbUpdatedSetting.redirect_message,
      withdrawLimit: dbUpdatedSetting.withdraw_limit,
      // Keep other fields as they are
      link: dbUpdatedSetting.link,
      isFake: Boolean(dbUpdatedSetting.is_fake),
      isData: Boolean(dbUpdatedSetting.is_data),
      createdAt: dbUpdatedSetting.created_at,
      updatedAt: dbUpdatedSetting.updated_at
    };

    return res.status(200).json({
      status: true,
      message: "Success!!",
      setting: updatedSetting,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//handle setting switch
exports.handleSwitch = async (req, res) => {
  try {
    const setting = await Setting.findOne();

    if (!setting)
      return res
        .status(200)
        .json({ status: false, message: "Setting data does not Exist!" });

    let updateData = {};

    if (req.query.type === "googlePlay") {
      updateData.googlePlaySwitch = !setting.google_play_switch;
    } else if (req.query.type === "stripe") {
      updateData.stripeSwitch = !setting.stripe_switch;
    } else if (req.query.type === "data") {
      updateData.isData = !setting.is_data;
    } else if (req.query.type === "razorPay") {
      updateData.razorPaySwitch = !setting.razor_pay_switch;
    } else if (req.query.type === "app") {
      updateData.isAppActive = !setting.is_app_active;
    } else if (req.query.type === "fake") {
      updateData.isFake = !setting.is_fake;
    }

    const dbUpdatedSetting = await Setting.update(setting.id, updateData);

    // Map database keys to original camelCase format and convert boolean fields for response
    const updatedSetting = {
      _id: dbUpdatedSetting.id,
      agoraKey: dbUpdatedSetting.agora_key,
      agoraCertificate: dbUpdatedSetting.agora_certificate,
      privacyPolicyLink: dbUpdatedSetting.privacy_policy_link,
      privacyPolicyText: dbUpdatedSetting.privacy_policy_text,
      termAndCondition: dbUpdatedSetting.term_and_condition,
      googlePlayEmail: dbUpdatedSetting.google_play_email,
      googlePlayKey: dbUpdatedSetting.google_play_key,
      googlePlaySwitch: Boolean(dbUpdatedSetting.google_play_switch),
      stripeSwitch: Boolean(dbUpdatedSetting.stripe_switch),
      stripePublishableKey: dbUpdatedSetting.stripe_publishable_key,
      stripeSecretKey: dbUpdatedSetting.stripe_secret_key,
      isAppActive: Boolean(dbUpdatedSetting.is_app_active),
      welcomeMessage: dbUpdatedSetting.welcome_message,
      razorPayId: dbUpdatedSetting.razor_pay_id,
      razorPaySwitch: Boolean(dbUpdatedSetting.razor_pay_switch),
      razorSecretKey: dbUpdatedSetting.razor_secret_key,
      chargeForRandomCall: dbUpdatedSetting.charge_for_random_call,
      chargeForPrivateCall: dbUpdatedSetting.charge_for_private_call,
      coinPerDollar: dbUpdatedSetting.coin_per_dollar,
      coinCharge: dbUpdatedSetting.coin_charge,
      paymentGateway: dbUpdatedSetting.payment_gateway,
      redirectAppUrl: dbUpdatedSetting.redirect_app_url,
      redirectMessage: dbUpdatedSetting.redirect_message,
      withdrawLimit: dbUpdatedSetting.withdraw_limit,
      // Keep other fields as they are
      link: dbUpdatedSetting.link,
      isFake: Boolean(dbUpdatedSetting.is_fake),
      isData: Boolean(dbUpdatedSetting.is_data),
      createdAt: dbUpdatedSetting.created_at,
      updatedAt: dbUpdatedSetting.updated_at
    };

    return res.status(200).json({
      status: true,
      message: "Success!!",
      setting: updatedSetting,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};