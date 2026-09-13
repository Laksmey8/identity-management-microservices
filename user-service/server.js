require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const User = require("./models/User");

const app = express();
app.use(express.json());
connectDB();

// View own profile
app.get("/user/viewprofile", async (req, res) => {
  try {
    const email = req.headers["x-user-email"];
    console.log("viewprofile - x-user-email header:", email); // DEBUG
    const user = await User.findOne({ email }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update own profile
app.put("/user/updateprofile", async (req, res) => {
  try {
    const email = req.headers["x-user-email"];
    console.log("updateprofile - x-user-email header:", email); // DEBUG
    const { name, phone } = req.body;
    const user = await User.findOneAndUpdate(
      { email },
      { $set: { name, phone } },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Profile updated", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(5004, () => console.log("User Service on port 5004"));
