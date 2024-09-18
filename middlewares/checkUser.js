const jwt =require("jsonwebtoken")
const userModel= require("../models/user-model")
module.exports.checkuser=  function(req, res, next){
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
      const userdetail= await userModel.findOne({email:user}).select("-password")
      req.user=userdetail;
      return next();
    });
}