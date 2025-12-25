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
const multer = require("multer");
const appError = require("../utils/appError");
const router = express.Router();

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    const user = "user";
    const filename = `${user + "-" + Date.now()}.${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const imageType = file.mimetype.split("/")[0];
  if (imageType === "image") {
    return cb(null, true);
  } else {
    return cb(
      appError.create("file type is not supported", 400, httpsStatusText.ERROR),
      false
    );
  }
};
const upload = multer({ storage: diskStorage, fileFilter });

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
