const asyncWrapper = require("../middlewares/asyncWrapper");
const Product = require("../models/product.model");
const httpsStatusText = require("../utils/httpsStatusText");
const appError = require("../utils/appError");
const streamifier = require("streamifier");
const cloudinary = require("../cloudinary");

const getAllProducts = asyncWrapper(async (req, res) => {
  const q = req.query;
  const page = parseInt(q.page) || 1;
  const limit = parseInt(q.limit) || 10;
  const skip = (page - 1) * limit;
  const name = q.t;
  const price = q.price;
  const filter = {};

  if (name) {
    filter.name = { $regex: q.t, $options: "i" };
  }

  if (price) {
    filter.price = { $lt: price };
  }
  const products = await Product.find(filter, { __v: false })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    status: httpsStatusText.SUCCESS,
    data: {
      products,
    },
  });
});

const addProduct = asyncWrapper(async (req, res, next) => {
  const { name, price, description, inStock } = req.body;

  if (!name || !price || !description || !req.file) {
    return next(
      appError.create("Missing required fields", 400, httpsStatusText.FAIL)
    );
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const uploadResult = await cloudinary.uploader.upload(
    `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
    { folder: "products" }
  );

  const newProduct = await Product.create({
    name,
    price,
    description,
    inStock: inStock ?? true,
    image: uploadResult.secure_url,
  });

  res.status(201).json({
    status: "success",
    data: { product: newProduct },
  });
});

const getOneProduct = asyncWrapper(async (req, res, next) => {
  const id = req.params.id;
  const product = await Product.findById(id);
  if (!product) {
    return next(
      appError.create("Product not found", 404, httpsStatusText.FAIL)
    );
  }
  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
});

const updateProduct = asyncWrapper(async (req, res, next) => {
  const id = req.params.id;
  const data = req.body;
  const product = await Product.findOneAndUpdate({ _id: id }, data);

  if (!product) {
    return next(
      appError.create("Product not found", 404, httpsStatusText.FAIL)
    );
  }
  res.status(200).json({
    status: "success",
    data: {
      Edit: "true",
      Error: "false",
    },
  });
});
const deleteProduct = asyncWrapper(async (req, res, next) => {
  const id = req.params.id;

  const deleted = await Product.findByIdAndDelete(id);

  if (!deleted) {
    return next(
      appError.create("Product not found", 404, httpsStatusText.FAIL)
    );
  }

  res.status(200).json({
    status: "success",
    data: null,
  });
});
module.exports = {
  getAllProducts,
  addProduct,
  getOneProduct,
  updateProduct,
  deleteProduct,
};
