const asyncWrapper = require("../middlewares/asyncWrapper");
const appError = require("../utils/appError");
const httpsStatusText = require("../utils/httpsStatusText");
const Order = require("../models/order.model");
const ProductModel = require("../models/product.model");
const Cart = require("../models/cart.model");
const getAllOrders = asyncWrapper(async (req, res, next) => {
  const q = req.query;
  const page = parseInt(q.page) || 1;
  const limit = parseInt(q.limit) || 10;
  const skip = (page - 1) * limit;
  const orders = await Order.find({}, { __v: 0 }).skip(skip).limit(limit);
  res.status(200).json({
    status: "success",
    data: {
      orders,
    },
  });
});

const createOrder = asyncWrapper(async (req, res, next) => {
  const { productId, quantity, fullName, address, phone } = req.body;

  const product = await ProductModel.findById(productId);

  if (!product) {
    return next(appError.create("Product not found", 404));
  }

  const itemTotal = product.price * quantity;

  const order = await Order.create({
    userId: req.currentUser.id,
    items: [
      {
        productId: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity,
      },
    ],
    totalPrice: itemTotal,
    personData: {
      fullName,
      address,
      phone,
    },
  });

  res.status(201).json({
    status: "success",
    data: {
      order,
    },
  });
});

const deleteOrder = asyncWrapper(async (req, res, next) => {
  const id = req.params.id;
  const order = await Order.findByIdAndDelete(id);
  if (!order) {
    return next(appError.create("Order not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      order,
    },
  });
});

const checkoutFromCart = asyncWrapper(async (req, res, next) => {
  const { fullName, address, phone } = req.body;

  const cart = await Cart.findOne({ user: req.currentUser.id }).populate(
    "items.product"
  );

  if (!cart || cart.items.length === 0) {
    return next(appError.create("Cart is empty", 400));
  }

  let totalPrice = 0;

  const orderItems = cart.items.map((item) => {
    totalPrice += item.product.price * item.quantity;

    return {
      productId: item.product._id,
      name: item.product.name,
      image: item.product.image,
      price: item.product.price,
      quantity: item.quantity,
    };
  });

  const order = await Order.create({
    userId: req.currentUser.id,
    items: orderItems,
    totalPrice,
    personData: {
      fullName,
      address,
      phone,
    },
  });

  cart.items = [];
  await cart.save();

  res.status(201).json({
    status: "success",
    data: {
      order,
    },
  });
});

module.exports = { getAllOrders, createOrder, deleteOrder, checkoutFromCart };
