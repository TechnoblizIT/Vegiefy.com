const jwt = require("jsonwebtoken");
const userModel = require("../models/deliveryboydata-model");

module.exports.checkDelivery = async function (req, res, next) {
  let tokken = req.cookies.tokken;

  if (!tokken) {
    req.user = null;
    return next();
  }

  jwt.verify(tokken, process.env.JWT_SECRET, async (err, decodedToken) => {
    if (err) {
      req.user = null;
      return next();
    }

    try {
      // Extract the email from the decoded token
      const { user: username } = decodedToken;

      // Find user in the database using the email
      const userdetail = await userModel.findOne({ username }).select("-password");

      req.user = userdetail; // Attach user details to req.user
    } catch (error) {
      console.error("Error fetching user details:", error);
      req.user = null;
    }

    return next();
  });
};
