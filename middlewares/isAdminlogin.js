const jwt = require("jsonwebtoken")

module.exports.adminLogin =(req,res,next) => {
    let tokken = req.cookies.tokken;
if (!tokken) {
  req.flash("error","You must be logged in")
   res.redirect("/admin/login")
}
else{
    jwt.verify(tokken, process.env.JWT_SECRET, async (err, user) => {
      if (err) {
       
        res.redirect("/admin/login");
      }
      next();
    });
  
}}