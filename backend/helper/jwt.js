const jwt = require("jsonwebtoken");
const privateKey = process.env.JWT_KEY;

module.exports.jwtSign = async (payload) => {
  return jwt.sign(
    { username: payload.username, email: payload.email },
    privateKey,
    { algorithm: "HS256", expiresIn: "7d" },
  );
};

module.exports.jwtVerify = async (token) => {
  return jwt.verify(token, privateKey, { algorithms: ["HS256"] });
};
