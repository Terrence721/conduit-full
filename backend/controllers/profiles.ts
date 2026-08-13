import type { Request, Response, NextFunction } from "express";
import models from "../models";
import helpers from "../helper/helpers";
import customErrors from "../helper/customErrors";

const { UnauthorizedError, NotFoundError } = customErrors;
const { appendFollowers } = helpers;
const { User } = models;

//? Profile
const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { loggedUser } = req;
    const { username } = req.params;

    const profile = await User.findOne({
      where: { username: username },
      attributes: { exclude: ["email"] },
    });
    if (!profile) throw new NotFoundError("User profile");

    await appendFollowers(loggedUser, profile);

    res.json({ profile });
  } catch (error) {
    next(error);
  }
};

//* Follow/Unfollow Profile
const followToggler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { loggedUser } = req;
    if (!loggedUser) throw new UnauthorizedError();

    const { username } = req.params;

    const profile = await User.findOne({
      where: { username: username },
      attributes: { exclude: ["email"] },
    });
    if (!profile) throw new NotFoundError("User profile");

    if (req.method === "POST") {
      await profile.addFollower(loggedUser);
    } else if (req.method === "DELETE") {
      await profile.removeFollower(loggedUser);
    }

    await appendFollowers(loggedUser, profile);

    res.json({ profile });
  } catch (error) {
    next(error);
  }
};

export = { getProfile, followToggler };
