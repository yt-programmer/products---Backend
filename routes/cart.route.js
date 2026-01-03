const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const {
  getCart,
  addToCart,
  updateCart,
  deleteFromCart,
} = require("../controllers/cart.controller");
const router = express.Router();

router.route("/").get(verifyToken, getCart).post(verifyToken, addToCart);

router
  .route("/:id")
  .patch(verifyToken, updateCart)
  .delete(verifyToken, deleteFromCart);

module.exports = router;
