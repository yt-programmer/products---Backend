const appError = require("../utils/appError");
const httpsStatusText = require("../utils/httpsStatusText");
const jwt = require("jsonwebtoken");
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return next(appError.create("token not found", 401, httpsStatusText.FAIL));
  }
  try {
    const currentUser = jwt.verify(token, process.env.JWT_SECRET);
    req.currentUser = currentUser;
    next();
  } catch (error) {
    return next(appError.create("Unauthorized", 401, httpsStatusText.ERROR));
  }
};

module.exports = verifyToken;
