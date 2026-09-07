import type { Request, Response, NextFunction } from "express";
import models from "../models";
import customErrors from "../helper/customErrors";
import jwtHelper from "../helper/jwt";

const { NotFoundError, UnauthorizedError } = customErrors;
const { jwtVerify } = jwtHelper;
const { User } = models;

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { headers } = req;
    if (!headers.authorization) return next();

    const token = headers.authorization.split(" ")[1];
    if (!token) throw new SyntaxError("Token missing or malformed");

    const userVerified = await jwtVerify(token);
    if (!userVerified) throw new Error("Invalid Token");

    req.loggedUser = await User.findOne({
      attributes: { exclude: ["email"] },
      where: { email: userVerified.email },
    });

    if (!req.loggedUser) return next(new NotFoundError("User"));

    headers.email = userVerified.email;
    req.loggedUser.dataValues.token = token;

    next();
  } catch (error) {
    next(error);
  }
};

// verifyToken is soft-auth: it attaches req.loggedUser when a valid token is
// present but never rejects, since some routes work with or without one.
// requireAuth is the explicit opt-in for routes that actually need a
// logged-in user -- mount it after verifyToken, not instead of it.
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.loggedUser) return next(new UnauthorizedError());
  next();
};

export = { verifyToken, requireAuth };
