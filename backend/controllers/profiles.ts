import type { Request, Response, NextFunction } from "express";
import models from "../models";
import helpers from "../helper/helpers";

const { appendFollowers, findProfileByUsernameOrFail } = helpers;
const { User } = models;

//? Profile
const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { loggedUser } = req;
    const { username } = req.params;

    const profile = await findProfileByUsernameOrFail(User, username as string);

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

    const profile = await findProfileByUsernameOrFail(User, username as string);

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
