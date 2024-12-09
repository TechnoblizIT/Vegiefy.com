const jwt = require("jsonwebtoken");
const adminModel = require("../models/admin-model");

module.exports.isAdmin = async function (req, res, next) {
  try {
    let tokken = req.cookies.tokken;

    if (!tokken) {
      req.user = null;
      return next(); 
    }

    // Verify JWT token
    jwt.verify(tokken, process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        console.error("JWT Verification Error:", err.message);
        req.user = null;
        return next(); 
      }

      // Check if the user is an admin
      if (decodedToken.role === "admin") {
        try {
          const userDetail = await adminModel
            .findOne({ email: decodedToken.user })
            .select("-password");

          if (!userDetail) {
            req.user = null; 
            return next();
          }

          req.user = userDetail; // Attach admin details to req.user
          return next(); // Continue to the next middleware
        } catch (dbError) {
          console.error("Database Error:", dbError.message);
          req.user = null;
          return next();
        }
      } else {
        req.user = null; // Not an admin
        return next(); // Proceed as unauthenticated
      }
    });
  } catch (error) {
    console.error("Middleware Error:", error.message);
    req.user = null;
    return next(); // Ensure middleware does not block the request
  }
};
