const userModel=require('../models/user-model')
const bcrypt = require('bcrypt');
const {genrateToken }=require("../utils/generateToken");
const { model } = require('mongoose');

module.exports.registerUser =  async function(req,res){
   try{ let { name , email, password} = req.body;
    const user = await userModel.findOne({email:email})
    if(!user){
        bcrypt.genSalt(password, async function (err, salt) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new userModel({
              name,
              email,
              password: hashedPassword,
            }
        )
        console.log(newUser);
        await newUser.save();
        const tokken = genrateToken(newUser);
        res.cookie("tokken", tokken);
        res.redirect("/")
    })
    }
    else{
        req.flash("error", "Email already registered")
        res.redirect("/login")
    }
}
catch(e){ 
    console.log(e)}

}
module.exports.loginUser = async function (req, res) {
  try{  
    let { email, password } = req.body;
    const user = await userModel.findOne({ email: email });

    if (!user) {
      req.flash("error","Email or password incorrect")
      res.redirect("/login")
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      req.flash("error","Email or password incorrect")
      res.redirect("/login")
    }

    const tokken = genrateToken(user);
    res.cookie("tokken", tokken);
    res.redirect("/")
}
catch(e){ 
    console.log(e.message)}
  };

  module.exports.logoutUser = async function (req, res) {
    res.cookie("tokken","")
    res.redirect("/")
  }