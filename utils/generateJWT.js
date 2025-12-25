const jwt = require("jsonwebtoken");
const generateJWT = (payload, secret, options) => {
  return jwt.sign(payload, secret, options);
};
module.exports = { generateJWT };
