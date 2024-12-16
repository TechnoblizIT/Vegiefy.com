const jwt = require("jsonwebtoken");
const userModel = require("../models/deliveryboydata-model");

module.exports.isDeliverylogin = (req, res, next) => {
  let tokken = req.cookies.tokken;

  if (!tokken) {
    req.flash("error", "You must be logged in");
    return res.redirect("/delivery/login");
  }

  jwt.verify(tokken, process.env.JWT_SECRET, async (err, decodedToken) => {
    if (err) {
      req.flash("error", "Invalid token. Please log in again.");
      return res.redirect("/delivery/login");
    }

    try {
      const { user: username, role } = decodedToken;

      if (role !== "Delivery") {
        req.flash("error", "Access denied.");
        return res.redirect("/delivery/login");
      }

      const userdetail = await userModel.findOne({ username });
      if (!userdetail) {
        req.flash("error", "User not found.");
        return res.redirect("/delivery/login");
      }

      req.user = userdetail; // Store user details in `req.user`
      next();
    } catch (error) {
      console.error("Error in isloggedin middleware:", error);
      req.flash("error", "An error occurred. Please try again.");
      return res.redirect("/delivery/login");
    }
  });
};
