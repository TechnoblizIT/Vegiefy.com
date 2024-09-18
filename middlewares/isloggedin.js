const jwt = require("jsonwebtoken")
const userModel=require("../models/user-model")

module.exports.isloggedin =(req,res,next) => {
    let tokken = req.cookies.tokken;
if (!tokken) {
  req.flash("error","You must be logged in")
   res.redirect("/login")
}
else{
    jwt.verify(tokken, process.env.JWT_SECRET, async (err, user) => {
      if (err) {
       
        res.redirect("/login");
      }
      next();
    });
  
}}