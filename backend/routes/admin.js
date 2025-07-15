const express = require("express");
const router = express.Router();
const User = require("../models/userModel");

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  return res.status(403).json({ message: "Access denied" });
};

module.exports = router;
