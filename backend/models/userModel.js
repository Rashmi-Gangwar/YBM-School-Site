import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    miniLength: [8, "Password must have at least 8 characters."],
    maxLength: [12, "Password cannot have more than 32 characters."],
    select: false,
  },
  role: {
    type: String,
    enem: ["user" , "admin"],
    default: "user",
  },
  phone: Number,
  accountVerified: { type: Boolean, default: false },
  verificationCode: Number,
  verificationCodeExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateVerificationCode = function () {
  function generateRandomFiveDigitNumber() {
    const firstDigit = Math.random(10000, 99999);

    return parseInt(firstDigit * 100000);
  }

  const verificationCode = generateRandomFiveDigitNumber(); // yha pe verification code generate hoga
  this.verificationCode = verificationCode;
  this.verificationCodeExpire = Date.now() + 10 * 60 * 1000; // code expire time (abhi iska 10 min ka time hai varna 5 ko change kar sakhte ho jaise 15 means 15 min )

  return verificationCode;
};

userSchema.methods.generateToken = async function () {
  return await jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

userSchema.methods.generateResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

export const User = mongoose.model("user", userSchema);
