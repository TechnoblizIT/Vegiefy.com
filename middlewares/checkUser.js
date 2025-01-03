const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model");

module.exports.checkuser = async function (req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token) {
      req.user = null; 
      return next();
    }

  
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        console.error("JWT verification error:", err.message);
        req.user = null; 
        return next();
      }

      const { user: email } = decodedToken; 

      try {
    
        const userDetail = await userModel.findOne({ email }).select("-password");
        req.user = userDetail || null; 
      } catch (dbError) {
        console.error("Error fetching user details from DB:", dbError.message);
        req.user = null; 
      }

      return next();
    });
  } catch (error) {
    console.error("Unexpected error in checkuser middleware:", error.message);
    req.user = null; 
    next();
  }
};
