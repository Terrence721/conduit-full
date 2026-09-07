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
// Bound to "add"/"remove" at route-registration time (see
// routes/profiles.ts) rather than re-deriving the action from req.method at
// request time -- the route already knows which verb it is.
const followToggler =
  (action: "add" | "remove") =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { loggedUser } = req;

      const { username } = req.params;

      const profile = await findProfileByUsernameOrFail(
        User,
        username as string,
      );

      if (action === "add") await profile.addFollower(loggedUser);
      else await profile.removeFollower(loggedUser);

      await appendFollowers(loggedUser, profile);

      res.json({ profile });
    } catch (error) {
      next(error);
    }
  };

export = { getProfile, followToggler };
