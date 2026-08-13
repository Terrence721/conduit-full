import type { Request, Response, NextFunction } from "express";
import customErrors from "../helper/customErrors";
import bcryptHelper from "../helper/bcrypt";

const { UnauthorizedError } = customErrors;
const { bcryptHash } = bcryptHelper;

const UPDATABLE_FIELDS = ["username", "bio", "image", "email"] as const;

//* Current User
const currentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { loggedUser } = req;
    if (!loggedUser) throw new UnauthorizedError();

    loggedUser.dataValues.email = req.headers.email;
    delete req.headers.email;

    res.json({ user: loggedUser });
  } catch (error) {
    next(error);
  }
};

//* Update User
const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { loggedUser } = req;
    if (!loggedUser) throw new UnauthorizedError();

    const { password, ...user } = req.body.user;

    for (const field of UPDATABLE_FIELDS) {
      if (user[field] !== undefined) loggedUser[field] = user[field];
    }

    if (password !== undefined && password !== "") {
      loggedUser.password = await bcryptHash(password);
    }

    await loggedUser.save();

    if (loggedUser.dataValues.email === undefined) {
      loggedUser.dataValues.email = req.headers.email;
    }
    delete req.headers.email;

    res.json({ user: loggedUser });
  } catch (error) {
    next(error);
  }
};

export = { currentUser, updateUser };
