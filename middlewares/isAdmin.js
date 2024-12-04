const jwt =require("jsonwebtoken")
const userModel= require("../models/user-model");
const adminModel = require("../models/admin-model");
module.exports.isAdmin=function(req, res, next){
    let tokken = req.cookies.tokken;
    if (!tokken) {
        req.user=null
        return next()
    }
    jwt.verify(tokken, process.env.JWT_SECRET, async (err, user) => {
      if (err) {
         req.user=null
        return next()
      }
      if(user.role=="admin"){
      const userdetail= await adminModel.findOne({email:user.user}).select("-password")
       console.logz(userdetail)
       req.user=userdetail
       return next()
      }
      
    });
}