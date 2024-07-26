const express = require('express');
const router=express.Router();
const {registerUser,loginUser,logoutUser}=require("../controllers/authController")
const {checkuser}= require("../middlewares/checkUser")
const{isloggedin}=require("../middlewares/isloggedin")

// Define the routes


router.post('/create', registerUser);

router.post('/login', loginUser);

router.get('/logout', logoutUser);

router.get('/profile',checkuser,isloggedin, (req,res)=>{
    res.render("profile",{req})
});

module.exports = router;