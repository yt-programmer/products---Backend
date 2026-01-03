const exprees = require("express");

const router = exprees.Router();

const verifyToken = require("../middlewares/verifyToken");
const { to } = require("../middlewares/To");
const {
  getAllOrders,
  deleteOrder,
  createOrder,
  checkoutFromCart,
} = require("../controllers/order.controller");

router
  .route("/")
  .get(verifyToken, to("admin"), getAllOrders)
  .post(verifyToken, createOrder);

router.route("/:id").delete(verifyToken, to("admin"), deleteOrder);

router.post("/checkout", verifyToken, checkoutFromCart);

module.exports = router;
