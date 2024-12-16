const jwt =require("jsonwebtoken");

module.exports.genrateTokenDelivery = function(user){
   return jwt.sign({user:user.username,role:"Delivery"},process.env.JWT_SECRET)
}