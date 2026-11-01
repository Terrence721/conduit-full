import type { Request, Response, NextFunction } from "express";
import bcryptHelper from "../helper/bcrypt";
import customErrors from "../helper/customErrors";

const { bcryptHash } = bcryptHelper;
const { ValidationError } = customErrors;

const UPDATABLE_FIELDS = ["username", "bio", "image", "email"] as const;

//* Current User
const currentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { loggedUser } = req;

    res.json({ user: loggedUser });
  } catch (error) {
    next(error);
  }
};

//* Update User
const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { loggedUser } = req;

    if (
      !req.body ||
      typeof req.body.user !== "object" ||
      req.body.user === null ||
      Array.isArray(req.body.user)
    ) {
      throw new ValidationError("user payload is required");
    }

    const { password, ...user } = req.body.user;

    const stringFields = ["username", "bio", "image", "email"] as const;
    for (const field of stringFields) {
      if (user[field] !== undefined && typeof user[field] !== "string") {
        throw new ValidationError(`${field} must be a string`);
      }
    }

    if (
      user.email !== undefined &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)
    ) {
      throw new ValidationError("email must be valid");
    }

    if (
      password !== undefined &&
      password !== "" &&
      (typeof password !== "string" || password.length < 8)
    ) {
      throw new ValidationError("password must be at least 8 characters");
    }

    for (const field of UPDATABLE_FIELDS) {
      if (user[field] !== undefined) loggedUser[field] = user[field];
    }

    if (password !== undefined && password !== "") {
      loggedUser.password = await bcryptHash(password);
    }

    await loggedUser.save();

    res.json({ user: loggedUser });
  } catch (error) {
    next(error);
  }
};

export = { currentUser, updateUser };
