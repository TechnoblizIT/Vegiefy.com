const jwt =require("jsonwebtoken");

module.exports.genrateToken = function(user){
   return jwt.sign({user:user.email,role:"user"},process.env.JWT_SECRET)
}