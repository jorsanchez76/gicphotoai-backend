//Express
const express = require("express");
const route = express.Router();

//Security Key
const checkAccessWithSecretKey = require("../../checkAccess");

const NotificationController = require("./notification.controller");

//Get User Notification List
route.get(
  "/userList",
  checkAccessWithSecretKey(),
  NotificationController.getUserNotifications
);

//Get Host Notification List
route.get(
  "/hostList", 
  checkAccessWithSecretKey(),
  NotificationController.getHostNotifications
);

//Update FCM token
route.post(
  "/updateFCM",
  checkAccessWithSecretKey(),
  NotificationController.updateFCM
);

//Create notification
route.post(
  "/create",
  checkAccessWithSecretKey(),
  NotificationController.createNotification
);

module.exports = route;