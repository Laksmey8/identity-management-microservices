require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");

const app = express();
app.use(express.json());
connectDB();

app.post("/register/userregister", async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name, email, password: hashedPassword, role: role || "user", phone,
    });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(5001, () => console.log("Register Service on port 5001"));
