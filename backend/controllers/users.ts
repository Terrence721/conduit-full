import type { Request, Response, NextFunction } from "express";
import models from "../models";
import jwtHelper from "../helper/jwt";
import bcryptHelper from "../helper/bcrypt";
import customErrors from "../helper/customErrors";

const { User } = models;
const { jwtSign } = jwtHelper;
const { bcryptHash, bcryptCompare } = bcryptHelper;
const {
  ValidationError,
  FieldRequiredError,
  AlreadyTakenError,
  NotFoundError,
} = customErrors;

// Register
const signUp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, bio, image, password } = req.body.user;
    if (!username) throw new FieldRequiredError(`A username`);
    if (!email) throw new FieldRequiredError(`An email`);
    if (!password) throw new FieldRequiredError(`A password`);

    const emailExists = await User.findOne({
      where: { email: email },
    });
    if (emailExists) throw new AlreadyTakenError("Email", "try logging in");

    const usernameExists = await User.findOne({
      where: { username: username },
    });
    if (usernameExists) throw new AlreadyTakenError("Username");

    const newUser = await User.create({
      email: email,
      username: username,
      bio: bio,
      image: image,
      password: await bcryptHash(password),
    });

    newUser.dataValues.token = await jwtSign(newUser);

    res.status(201).json({ user: newUser });
  } catch (error) {
    next(error);
  }
};

// Login
const signIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req.body;

    const existentUser = await User.findOne({ where: { email: user.email } });
    if (!existentUser) throw new NotFoundError("Email", "sign in first");

    const pwd = await bcryptCompare(user.password, existentUser.password);
    if (!pwd) throw new ValidationError("Wrong email/password combination");

    existentUser.dataValues.token = await jwtSign(existentUser);

    res.json({ user: existentUser });
  } catch (error) {
    next(error);
  }
};

export = { signUp, signIn };
