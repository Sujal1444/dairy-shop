const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Product = require("../models/Product");
const Entry = require("../models/Entry");
const { ensureDefaultProductsForUser } = require("./productController");
const sendEmail = require("../utils/sendEmail");

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  dairyName: user.dairyName,
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
    const { name, dairyName, email, password } = req.body;

    if (!name || !dairyName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, dairy name, email, and password are required",
      });
    }

    const user = await User.create({
      name: name.trim(),
      dairyName: dairyName.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
    });

    await ensureDefaultProductsForUser(user._id);

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

exports.updateMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { name, dairyName, email, password } = req.body;

    if (typeof name === "string") {
      const trimmedName = name.trim();
      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }
      user.name = trimmedName;
    }

    if (typeof dairyName === "string") {
      const trimmedDairyName = dairyName.trim();
      if (!trimmedDairyName) {
        return res.status(400).json({
          success: false,
          message: "Dairy name cannot be empty",
        });
      }
      user.dairyName = trimmedDairyName;
    }

    if (typeof email === "string") {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) {
        return res.status(400).json({
          success: false,
          message: "Email cannot be empty",
        });
      }
      user.email = normalizedEmail;
    }

    if (typeof password === "string" && password.trim()) {
      if (password.trim().length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }
      user.password = password.trim();
    }

    await user.save();

    res.status(200).json({
      success: true,
      user: sanitizeUser(user),
      message: "Profile updated successfully",
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteMe = async (req, res) => {
  try {
    await Promise.all([
      Entry.deleteMany({ user: req.user.id }),
      Product.deleteMany({ user: req.user.id }),
      User.findByIdAndDelete(req.user.id),
    ]);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
    });
  }
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
