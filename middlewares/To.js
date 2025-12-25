const appError = require("../utils/appError");
const httpsStatusText = require("../utils/httpsStatusText");
const to = (role) => {
  return (req, res, next) => {
    const userRole = req.currentUser.role;
    if (userRole !== role) {
      return next(
        appError.create(
          "You are not authorized to access this route",
          403,
          httpsStatusText.FAIL
        )
      );
    }
    next();
  };
};

module.exports = { to };
