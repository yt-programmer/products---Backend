const express = require("express");
const router = express.Router();

const { sendMail } = require("../controllers/sendMail.controller");

router.post("/", sendMail);

module.exports = router;
