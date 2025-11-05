import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  coverImageUrl: String,
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now },
});

const Post = mongoose.model("Post", postSchema);
export default Post;
