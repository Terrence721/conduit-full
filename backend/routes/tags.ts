import express from "express";
import type { Request, Response, NextFunction } from "express";

const router = express.Router();
const { Tag } = require("../models");
const { appendTagList } = require("../helper/helpers");

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
