const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model");

module.exports.isloggedin = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      req.flash("error", "You must be logged in.");
      return res.redirect("/login");
    }

    
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        console.error("JWT verification error:", err);
        req.flash("error", "Session expired. Please log in again.");
        return res.redirect("/login");
      }

      const { user: email, role } = decodedToken;

    
      if (!email || !role) {
        req.flash("error", "Invalid token data. Please log in again.");
        return res.redirect("/login");
      }

      const userDetail = await userModel.findOne({ email });
      if (!userDetail) {
        req.flash("error", "User not found. Please register or log in.");
        return res.redirect("/login");
      }

      
      if (role !== "User") {
        req.flash("error", "Access denied.");
        return res.redirect("/login");
      }

      req.user = userDetail; 
      next();
    });
  } catch (error) {
    console.error("Error in isloggedin middleware:", error.message);
    req.flash("error", "An unexpected error occurred. Please try again.");
    res.redirect("/login");
  }
};
