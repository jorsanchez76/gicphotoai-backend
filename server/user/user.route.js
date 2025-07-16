const express = require("express");
const router = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

const userController = require("./user.controller");

//get user profile
router.get("/userProfile", checkAccessWithSecretKey(), userController.userProfile);
router.post("/userProfile", checkAccessWithSecretKey(), userController.userProfile);

//create user
router.post("/create", checkAccessWithSecretKey(), userController.createUser);

//update user
router.patch("/update", checkAccessWithSecretKey(), userController.updateUser);

//get all users (admin route)
router.get("/", userController.getAllUsers);
router.get("/all", checkAccessWithSecretKey(), userController.getAllUsers);

//block/unblock user
router.patch("/:id/block", userController.toggleBlockUser);

module.exports = router;