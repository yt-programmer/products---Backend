const asyncWrapper = require("../middlewares/asyncWrapper");
const appError = require("../utils/appError");
const Cart = require("../models/cart.model");
const httpsStatusText = require("../utils/httpsStatusText");
const productModel = require("../models/product.model");
const getCart = asyncWrapper(async (req, res, next) => {
  const cart = await Cart.findOne(
    { user: req.currentUser.id },
    { __v: 0 }
  ).populate("items.product");

  res.status(200).json({
    status: "success",
    data: {
      cart: cart ? (cart.items.length > 0 ? cart : null) : null,
    },
  });
});

const addToCart = asyncWrapper(async (req, res, next) => {
  const { productId, quantity } = req.body;

  const product = await productModel.findById(productId);

  if (!product) {
    return next(
      appError.create("Product not found", 404, httpsStatusText.FAIL)
    );
  }

  let cart = await Cart.findOne({ user: req.currentUser.id });

  if (!cart) {
    const product = await productModel.findById(productId);

    if (!product) {
      return next(
        appError.create("Product not found", 404, httpsStatusText.FAIL)
      );
    }
    cart = await Cart.create({
      user: req.currentUser.id,
      items: [
        {
          product: productId,

          quantity: quantity,
        },
      ],
    });

    await cart.save();

    return res.status(200).json({
      status: "success",
      data: {
        cart,
      },
    });
  }

  if (cart.items.find((item) => item.product.toString() == productId)) {
    cart.items.find((item) => item.product.toString() == productId).quantity +=
      quantity;
    await cart.save();
    return res.status(200).json({
      status: "success",
      data: {
        cart,
      },
    });
  }
  cart.items.push({
    product: productId,
    quantity: quantity,
  });

  await cart.save();

  res.status(200).json({
    status: "success",
    data: {
      cart,
    },
  });
});

const updateCart = asyncWrapper(async (req, res, next) => {
  const { quantity } = req.body;
  const productId = req.params.id;

  const product = await productModel.findById(productId);
  if (!product) {
    return next(
      appError.create("Product not found", 404, httpsStatusText.FAIL)
    );
  }

  let cart = await Cart.findOne({ user: req.currentUser.id }, { __v: 0 });
  if (!cart) {
    return next(appError.create("Cart not found", 404, httpsStatusText.FAIL));
  }

  const item = cart.items.find((item) => item.product.toString() === productId);

  if (!item) {
    return next(
      appError.create("Product not found in cart", 404, httpsStatusText.FAIL)
    );
  }

  item.quantity = quantity;
  await cart.save();

  cart = await Cart.findOne({ user: req.currentUser.id }, { __v: 0 }).populate(
    "items.product"
  );

  return res.status(200).json({
    status: "success",
    data: { cart },
  });
});

const deleteFromCart = asyncWrapper(async (req, res, next) => {
  const productId = req.params.id;

  const product = await productModel.findById(productId);

  if (!product) {
    return next(
      appError.create("Product not found", 404, httpsStatusText.FAIL)
    );
  }

  let cart = await Cart.findOne({ user: req.currentUser.id });

  if (!cart) {
    return next(appError.create("Cart not found", 404, httpsStatusText.FAIL));
  }

  if (cart.items.find((item) => item.product.toString() == productId)) {
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );
    await cart.save();

    cart = await Cart.findOne(
      { user: req.currentUser.id },
      { __v: 0 }
    ).populate("items.product");
    return res.status(200).json({
      status: "success",
      data: {
        msg: "Product removed from cart",
        cart,
      },
    });
  }

  return next(appError.create("Product not found", 404, httpsStatusText.FAIL));
});

module.exports = {
  getCart,
  addToCart,
  deleteFromCart,
  updateCart,
};
