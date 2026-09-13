require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const User = require("./models/User");

const app = express();
app.use(express.json());
connectDB();

// Search user by name or email
app.get("/admin/searchuser", async (req, res) => {
  try {
    const { query } = req.query; // pass ?query=someone
    const user = await User.findOne({
      $or: [{ name: query }, { email: query }],
    }).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// View all users
app.get("/admin/viewalluser", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete user by email
app.delete("/admin/deluser", async (req, res) => {
  try {
    const { email } = req.body;
    const result = await User.findOneAndDelete({ email });
    if (!result) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(5003, () => console.log("Admin Service on port 5003"));
