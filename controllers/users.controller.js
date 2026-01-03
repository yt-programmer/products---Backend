const asyncWrapper = require("../middlewares/asyncWrapper");
const User = require("../models/user.model");
const appError = require("../utils/appError");
const httpsStatusText = require("../utils/httpsStatusText");
const bcrypt = require("bcryptjs");
const { generateJWT } = require("../utils/generateJWT");

const getAllUsers = asyncWrapper(async (req, res) => {
  const users = await User.find({}, { password: 0, __v: 0 });

  res.status(200).json({
    status: "success",
    data: {
      users,
    },
  });
});

const register = asyncWrapper(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return next(
      appError.create("Missing required fields", 400, httpsStatusText.FAIL)
    );
  }
  const user = await User.findOne({ email: email });

  if (user) {
    return next(
      appError.create("Email already exists", 400, httpsStatusText.FAIL)
    );
  }
  const hashpass = await bcrypt.hash(password.trim(), 10);

  const newUser = await new User({
    name: name,
    email: email,
    password: hashpass,
    role: role || "user",
  });

  const jwt = generateJWT(
    { email: email, role: newUser.role, id: newUser._id },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
  let cookieOptions;
  if (process.env.NODE_ENV === "prod") {
    cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    };
  } else {
    cookieOptions = {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    };
  }
  res.cookie("token", jwt, cookieOptions);
  await newUser.save();
  res.status(201).json({
    status: "success",
    data: {
      newUser,
    },
  });
});

const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(
      appError.create("Missing required fields", 400, httpsStatusText.FAIL)
    );
  }
  const user = await User.findOne({ email: email });
  if (!user) {
    return next(
      appError.create("Account Not Found", 401, httpsStatusText.FAIL)
    );
  }
  if (!(await bcrypt.compare(password.trim(), user.password))) {
    return next(
      appError.create("password is not correct", 400, httpsStatusText.FAIL)
    );
  }
  const jwt = generateJWT(
    { email: email, role: user.role, id: user._id },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  res.cookie("token", jwt, {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

const logout = asyncWrapper(async (req, res, next) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });
  res.status(200).json({
    status: "success",
    data: {
      msg: "Logout Successful",
    },
  });
});

const me = asyncWrapper(async (req, res, next) => {
  const user = req.currentUser;

  if (!user) {
    return next(appError.create("Unauthorized", 401, httpsStatusText.FAIL));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
module.exports = { login, register, getAllUsers, logout, me };
