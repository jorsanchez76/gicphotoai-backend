const express = require("express");
const router = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

const coinPlanController = require("./coinPlan.controller");

//get all coin plans
router.get("/", coinPlanController.index);

//get active coin plans for app
router.get("/appPlan", coinPlanController.appPlan);

//create coin plan
router.post("/", checkAccessWithSecretKey(), coinPlanController.store);

//update coin plan
router.put("/:id", checkAccessWithSecretKey(), coinPlanController.update);

//delete coin plan
router.delete("/:id", checkAccessWithSecretKey(), coinPlanController.destroy);

//create coin purchase history
router.post("/createHistory", checkAccessWithSecretKey(), coinPlanController.createHistory);

module.exports = router;