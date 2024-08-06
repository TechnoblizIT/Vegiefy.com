const express = require('express');
const router=express.Router();
const {registerUser,loginUser,logoutUser}=require("../controllers/authController")
const {checkuser}= require("../middlewares/checkUser")
const{isloggedin}=require("../middlewares/isloggedin")
const userModel=require("../models/user-model")

// Define the routes


router.post('/create', registerUser);

router.post('/login', loginUser);

router.get('/logout', logoutUser);

router.get('/profile',checkuser,isloggedin, (req,res)=>{
    res.render("profile",{req})
});

router.get("/addtocart/:productid",isloggedin, checkuser,async(req,res)=>{
    const user=await userModel.findOne({email:req.user.email});
    user.cart.push(req.params.productid); 
    await user.save();
    res.redirect("/product")
});

router.get("/removeitem/:productid",isloggedin, checkuser,async(req,res)=>{
    const user=await userModel.findOne({email:req.user.email});
    user.cart.pop(req.params.productid);
    await user.save();
    res.redirect("/cart")

})

module.exports = router;