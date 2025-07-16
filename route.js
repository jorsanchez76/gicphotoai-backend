const express = require("express");
const router = express.Router();

//import routes
const settingRoute = require("./server/setting/setting.route");
const userRoute = require("./server/user/user.route");
const notificationRoute = require("./server/notification/notification.route");
const gichubRoute = require("./server/gichub/gichub.route");
const userFlagsRoute = require("./server/user_flags/user_flags.route");
const configRoute = require("./server/config/config.route");
const adminRoute = require("./server/admin/admin.route");
const coinPlanRoute = require("./server/coinPlan/coinPlan.route");
const coinHistoryRoute = require("./server/coin_history/coinHistory.route");

//middleware routes
router.use("/setting", settingRoute);
router.use("/user", userRoute);
router.use("/notification", notificationRoute);
router.use("/gichub", gichubRoute);
router.use("/user_flags", userFlagsRoute);
router.use("/config", configRoute);
router.use("/admin", adminRoute);
router.use("/coinPlan", coinPlanRoute);
router.use("/coin_history", coinHistoryRoute);

module.exports = router;