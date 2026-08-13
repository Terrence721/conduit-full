import express from "express";
import type { Request, Response, NextFunction } from "express";
import models from "../models";
import helpers from "../helper/helpers";

const router = express.Router();
const { Tag } = models;
const { appendTagList } = helpers;

// All Tags
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tagList = await Tag.findAll();

    const tags = appendTagList(tagList);

    res.json({ tags });
  } catch (error) {
    next(error);
  }
});

export = router;
