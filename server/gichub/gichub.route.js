const express = require("express");
const router = express.Router();

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({
  storage,
});

const checkAccessWithSecretKey = require("../../checkAccess");

const gichubController = require("./gichub.controller");

router.post("/gichubUpload", checkAccessWithSecretKey(), upload.single("dataFile"), gichubController.upload);

router.post("/gichubMove", checkAccessWithSecretKey(), gichubController.move);

router.post("/gichubList", checkAccessWithSecretKey(), gichubController.list);

router.post("/gichubDelete", checkAccessWithSecretKey(), gichubController.delete);

module.exports = router;
