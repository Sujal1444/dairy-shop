const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    const error = new Error("JWT_SECRET is not configured");
    error.statusCode = 500;
    throw error;
  }

  return process.env.JWT_SECRET;
};

// ✅ JWT helper
const getSignedJwtToken = (id) => {
  return jwt.sign({ id }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

// ===============================
// 🔐 REGISTER
// ===============================
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    });

    const token = getSignedJwtToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
    });
  }
};

// ===============================
// 🔑 LOGIN
// ===============================
exports.login = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = getSignedJwtToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
    });
  }
};

// ===============================
// 👤 GET CURRENT USER
// ===============================
exports.getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: sanitizeUser(req.user),
  });
};

// ===============================
// 🔁 FORGOT PASSWORD
// ===============================
exports.forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user with that email",
      });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.headers.origin}/reset-password/${resetToken}`;

    const message = `Reset your password using this link:\n\n${resetUrl}`;

    await sendEmail({
      email: user.email,
      subject: "Password Reset",
      message,
    });

    res.status(200).json({
      success: true,
      message: "Email sent",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Email could not be sent",
    });
  }
};

// ===============================
// 🔄 RESET PASSWORD
// ===============================
exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resettoken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    const token = getSignedJwtToken(user._id);

    res.status(200).json({
      success: true,
      token,
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
    });
  }
};
