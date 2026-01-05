const express = require("express");
const {
  getAllProducts,
  addProduct,
  getOneProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/products.controller");
const verifyToken = require("../middlewares/verifyToken");
const { to } = require("../middlewares/To");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router
  .route("/")
  .get(getAllProducts)
  .post(verifyToken, to("admin"), upload.single("image"), addProduct);
router
  .route("/:id")
  .get(getOneProduct)
  .patch(verifyToken, to("admin"), updateProduct)
  .delete(verifyToken, to("admin"), deleteProduct);
module.exports = router;
