require("dotenv").config();
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const jwt = require("jsonwebtoken");

const app = express();

const verifyToken = (requiredRole) => (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== requiredRole) {
      return res.status(403).json({ message: "Forbidden: wrong role" });
    }
    req.user = decoded;
    req.headers["x-user-email"] = decoded.email;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

app.use("/register", createProxyMiddleware({
  target: "http://localhost:5001",
  changeOrigin: true,
  pathRewrite: { "^/": "/register/" },
}));

app.use("/auth", createProxyMiddleware({
  target: "http://localhost:5002",
  changeOrigin: true,
  pathRewrite: { "^/": "/auth/" },
}));

app.use("/admin", verifyToken("admin"), createProxyMiddleware({
  target: "http://172.31.18.46:5003",
  changeOrigin: true,
  pathRewrite: { "^/": "/admin/" },
}));

app.use("/user", verifyToken("user"), createProxyMiddleware({
  target: "http://172.31.28.87:5004",
  changeOrigin: true,
  pathRewrite: { "^/": "/user/" },
  on: {
    proxyReq: (proxyReq, req) => {
      if (req.user && req.user.email) {
        proxyReq.setHeader("x-user-email", req.user.email);
      }
    },
  },
}));

app.listen(8000, () => console.log("API Gateway running on port 8000"));
