const jwt =require("jsonwebtoken");

module.exports.genrateToken = function(user){
   return jwt.sign(user.email,process.env.JWT_SECRET)
}