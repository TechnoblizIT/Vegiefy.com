const express = require('express');
const router=express.Router();
const {isloggedin}= require("../middlewares/isloggedin")
const {checkuser}=require("../middlewares/checkUser")
const productModel=require("../models/product-model")
const userModel=require("../models/user-model")
// Define the routes

router.get('/',checkuser ,async function(req, res) {
   const products = await productModel.find()
   res.render('index',{req,products})
});

router.get('/login', function(req, res) {
   const errors=req.flash("error")
    res.render('login',{errors})
 });

 router.get('/product',checkuser ,async function(req, res) {
  try{ const products=await productModel.find()
   res.render('product',{products,req})}catch(err){ console.log(err.message) }
});

router.get('/blog',checkuser ,async function(req, res) {
   res.render('blog',{req})
 });

 router.get('/delivery', checkuser ,function(req, res) {
   res.render('deliverypage',{req})
});

 router.get('/contact', checkuser ,function(req, res) {
   res.render('contact',{req})
});

router.get('/cart',  isloggedin,checkuser ,async function(req, res) {
   const user = await userModel.findOne({email:req.user.email}).populate("cart")
   var carttotal=0;
   var cartcount=0
   user.cart.forEach((item)=>{ carttotal+=item.price 
      cartcount+=1
   })
   
   res.render('shoping_cart',{req,user,carttotal,cartcount})
});


module.exports = router;