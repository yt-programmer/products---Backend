const verifyToken = require("../middlewares/verifyToken");
const { to } = require("../middlewares/To");
const express = require("express");
const {
  getAllUsers,
  register,
  login,
  logout,
} = require("../controllers/users.controller");
const router = express.Router();

router.route("/").get(verifyToken, to("admin"), getAllUsers);

router.post("/register", register);

router.post("/login", login);
router.post("/logout", logout);
module.exports = router;
