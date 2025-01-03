const userModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const { genrateToken } = require("../utils/generateToken");

module.exports.registerUser = async function (req, res) {
  try {
    const { name, email, password } = req.body;

    // Validate input fields
    if (!name || !email || !password || password.trim() === "") {
      req.flash("error", "All fields are required");
      return res.redirect("/register");
    }

    const user = await userModel.findOne({ email });
    if (user) {
      req.flash("error", "Email already registered");
      return res.redirect("/login");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    const token = genrateToken(newUser);
    res.cookie("token", token);
    res.redirect("/");
  } catch (e) {
    console.error("Error registering user:", e.message);
    req.flash("error", "Something went wrong. Please try again.");
    res.redirect("/register");
  }
};

module.exports.loginUser = async function (req, res) {
  try {
    const { email, password } = req.body;

    // Validate input fields
    if (!email || !password || password.trim() === "") {
      req.flash("error", "Email and password are required");
      return res.redirect("/login");
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      req.flash("error", "Email or password incorrect");
      return res.redirect("/login");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash("error", "Email or password incorrect");
      return res.redirect("/login");
    }

    const token = genrateToken(user);
    res.cookie("token", token);
    res.redirect("/");
  } catch (e) {
    console.error("Error logging in user:", e.message);
    req.flash("error", "Something went wrong. Please try again.");
    res.redirect("/login");
  }
};

module.exports.logoutUser = async function (req, res) {
  try {
    res.cookie("token", "", { maxAge: 0 }); // Clear the token cookie
    res.redirect("/");
  } catch (e) {
    console.error("Error logging out user:", e.message);
    req.flash("error", "Something went wrong. Please try again.");
    res.redirect("/");
  }
};
