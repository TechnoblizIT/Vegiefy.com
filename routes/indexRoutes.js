const express = require('express');
const router=express.Router();
const {isloggedin}= require("../middlewares/isloggedin")
const {checkuser}=require("../middlewares/checkUser")
const productModel=require("../models/product-model")
const userModel=require("../models/user-model")
// Define the routes

router.get('/',checkuser ,function(req, res) {
   res.render('index',{req})
});

router.get('/login', function(req, res) {
   const errors=req.flash("error")
    res.render('login',{errors})
 });

 router.get('/product', checkuser ,async function(req, res) {
   const products=await productModel.find()
   res.render('product',{req,products})
});


router.get('/contact', checkuser ,function(req, res) {
   res.render('contact',{req})
});

router.get('/cart', checkuser, isloggedin ,async function(req, res) {
   const user = await userModel.findOne({email:req.user.email}).populate("cart")
   res.render('shoping_cart',{req,user})
});


module.exports = router;