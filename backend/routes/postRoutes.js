import express from "express";
import Post from "../models/Post.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const posts = await Post.find().populate("author", "username");
  res.json(posts);
});

router.post("/", protect, async (req, res) => {
  const post = new Post({ ...req.body, author: req.user });
  await post.save();
  res.json(post);
});

export default router;
