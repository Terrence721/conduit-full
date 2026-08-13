const jwt = require("jsonwebtoken");
const privateKey = process.env.JWT_KEY;

const jwtSign = async (payload: { username: string; email: string }) => {
  return jwt.sign(
    { username: payload.username, email: payload.email },
    privateKey,
    { algorithm: "HS256", expiresIn: "7d" },
  );
};

const jwtVerify = async (token: string) => {
  return jwt.verify(token, privateKey, { algorithms: ["HS256"] });
};

export = { jwtSign, jwtVerify };
