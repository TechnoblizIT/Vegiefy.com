const jwt =require("jsonwebtoken");

module.exports.genrateToken = function(user){
   return jwt.sign({user:user.email,role:"User"},process.env.JWT_SECRET)
}