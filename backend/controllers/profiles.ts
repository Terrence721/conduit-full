import type { Request, Response, NextFunction } from "express";
import models from "../models";
import helpers from "../helper/helpers";
import customErrors from "../helper/customErrors";

const { NotFoundError } = customErrors;
const { appendFollowers, PUBLIC_USER_ATTRIBUTES } = helpers;
const { User } = models;

//? Profile
const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { loggedUser } = req;
    const { username } = req.params;

    const profile = await User.findOne({
      where: { username: username },
      attributes: PUBLIC_USER_ATTRIBUTES,
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

    const { username } = req.params;

    const profile = await User.findOne({
      where: { username: username },
      attributes: PUBLIC_USER_ATTRIBUTES,
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
