const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model");

module.exports.isloggedin = (req, res, next) => {
  let tokken = req.cookies.tokken;

  if (!tokken) {
    req.flash("error", "You must be logged in");
    return res.redirect("/login");
  }

  jwt.verify(tokken, process.env.JWT_SECRET, async (err, decodedToken) => {
    if (err) {
      req.flash("error", "Invalid token. Please log in again.");
      return res.redirect("/login");
    }

    try {
      const { user: email, role } = decodedToken;

      if (role !== "User") {
        req.flash("error", "Access denied.");
        return res.redirect("/login");
      }

      const userdetail = await userModel.findOne({ email });
      if (!userdetail) {
        req.flash("error", "User not found.");
        return res.redirect("/login");
      }

      req.user = userdetail; // Store user details in `req.user`
      next();
    } catch (error) {
      console.error("Error in isloggedin middleware:", error);
      req.flash("error", "An error occurred. Please try again.");
      return res.redirect("/login");
    }
  });
};
