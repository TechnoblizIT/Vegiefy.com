const jwt =require("jsonwebtoken");

module.exports.genrateTokenAdmin = function(user){
   return jwt.sign({user:user.email,role:"Admin"},process.env.JWT_SECRET)
}