const jwt = require("jsonwebtoken");
const adminModel = require("../models/admin-model");
module.exports.adminLogin = (req, res, next) => {
  let tokken = req.cookies.tokken;

  if (!tokken) {
    req.flash("error", "You must be logged in");
    return res.redirect("/admin/login");
  }

  jwt.verify(tokken, process.env.JWT_SECRET, async (err, decodedToken) => {
    if (err) {
      req.flash("error", "Invalid token. Please log in again.");
      return res.redirect("/admin/login");
    }

    try {
      const { user: email, role } = decodedToken;

      if (role !== "Admin") {
        req.flash("error", "Admin access only.");
        return res.redirect("/admin/login");
      }

      const userdetail = await adminModel.findOne({ email });
      if (!userdetail) {
        req.flash("error", "Admin not found.");
        return res.redirect("/admin/login");
      }

      req.user = userdetail; 
      next();
    } catch (error) {
      console.error("Error in adminLogin middleware:", error);
      req.flash("error", "An error occurred. Please try again.");
      return res.redirect("/admin/login");
    }
  });
};
