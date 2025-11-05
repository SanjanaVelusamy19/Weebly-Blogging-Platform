import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";
import multer from "multer";
import path from "path";
import User from "./models/User.js";

dotenv.config();
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });


app.use("/uploads", express.static("uploads"));


const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err.message));


const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: String,
});

// Password comparison helper
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};


const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  coverImage: String,
  createdAt: { type: Date, default: Date.now },
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

const UserModel = mongoose.models.User || mongoose.model("User", userSchema);
const PostModel = mongoose.models.Post || mongoose.model("Post", postSchema);


app.post("/api/register", async (req, res) => {
  try {
    const { username, password, displayName } = req.body;
    if (!validator.isEmail(username))
      return res.status(400).json({ message: "Username must be a valid email" });

    const existing = await UserModel.findOne({ username });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await UserModel.create({ username, password: hashed, displayName });
    const token = jwt.sign({ id: user._id }, JWT_SECRET);

    res.json({ token, user });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Error registering user" });
  }
});


app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await UserModel.findOne({ username });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    res.json({ token, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});


app.post("/api/posts", upload.single("coverImage"), async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "Unauthorized, no token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await UserModel.findById(decoded.id);
    if (!user)
      return res.status(401).json({ message: "Invalid token or user not found" });

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const post = await PostModel.create({
      title: req.body.title,
      content: req.body.content,
      author: user.displayName || user.username,
      coverImage: imagePath,
    });

    res.json(post);
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: "Error creating post" });
  }
});


app.get("/api/posts", async (req, res) => {
  try {
    const posts = await PostModel.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ message: "Error fetching posts" });
  }
});


app.post("/api/posts/:id/comments", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await UserModel.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "Invalid token" });

    const post = await PostModel.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const newComment = {
      user: user._id,
      text: req.body.text,
    };

    post.comments.push(newComment);
    await post.save();

   
    await post.populate({
      path: "comments.user",
      select: "username displayName",
    });

    const lastComment = post.comments[post.comments.length - 1];
    res.json(lastComment);
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ message: "Server error while posting comment" });
  }
});


app.get("/api/posts/:id/comments", async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id)
      .populate("comments.user", "username displayName");
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post.comments);
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ message: "Error fetching comments" });
  }
});

app.put("/api/posts/:id", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await UserModel.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "Invalid token" });

    const post = await PostModel.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    
    if (post.author !== (user.displayName || user.username)) {
      return res.status(403).json({ message: "You can only edit your own posts" });
    }

    post.title = req.body.title || post.title;
    post.content = req.body.content || post.content;
    await post.save();

    res.json({ message: "Post updated successfully", post });
  } catch (err) {
    console.error("Error updating post:", err);
    res.status(500).json({ message: "Error updating post" });
  }
});


app.delete("/api/posts/:id", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await UserModel.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "Invalid token" });

    const post = await PostModel.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    
    if (post.author !== (user.displayName || user.username)) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    await PostModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ message: "Error deleting post" });
  }
});



app.listen(PORT, () =>
  console.log(`🚀 Backend listening on http://localhost:${PORT}`)
);
