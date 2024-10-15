const express = require('express');
const router=express.Router();
const {isloggedin}= require("../middlewares/isloggedin")
const {checkuser}=require("../middlewares/checkUser")
const productModel=require("../models/product-model")
const userModel=require("../models/user-model")
// Define the routes

router.get('/',checkuser ,async function(req, res) {
   const products = await productModel.find()
   var cartcount=0

   if (req.user){
   const user = await userModel.findOne({ email: req.user.email })
   .populate({
     path: 'cart.product',  
     model: 'Products'      
   });
   user.cart.forEach((item)=>{ cartcount+=1})
   res.render('index',{req,products})
   }else{
    res.render('index',{req,products,cartcount})
   }
});

router.get('/login', function(req, res) {
   const errors=req.flash("error")
    res.render('login',{errors})
 });

 router.get('/product',checkuser ,async function(req, res) {
  try{ 
    var cartcount=0
    const products=await productModel.find()
    if (req.user){
   const user = await userModel.findOne({ email: req.user.email })
   .populate({
     path: 'cart.product',  
     model: 'Products'      
   });
   var cartcount=0
   user.cart.forEach((item)=>{ cartcount+=1})
   res.render('product',{products,req,cartcount})}
   else{
    res.render('product',{products,req,cartcount})

   }
  
  }catch(err){ console.log(err.message) }
});

router.get('/blog',checkuser ,async function(req, res) {
  var cartcount=0
  if (req.user){
    const user = await userModel.findOne({ email: req.user.email })
    .populate({
      path: 'cart.product',  
      model: 'Products'      
    });
    user.cart.forEach((item)=>{ cartcount+=1})
    res.render('blog',{req})
    }else{
     res.render('blog',{req,cartcount})
    }
 });

 router.get('/delivery', checkuser ,async function(req, res) {
  var cartcount=0
  if (req.user){
   const user = await userModel.findOne({ email: req.user.email })
   .populate({
     path: 'cart.product',  
     model: 'Products'      
   });
   var cartcount=0
   user.cart.forEach((item)=>{ cartcount+=1})
   res.render('deliverypage',{req,cartcount})
  }
   else{
    res.render('deliverypage',{req,cartcount})
   }
});

 router.get('/contact', checkuser ,async function(req, res) {
  var cartcount=0
  if (req.user){
    const user = await userModel.findOne({ email: req.user.email })
    .populate({
      path: 'cart.product',  
      model: 'Products'      
    });
    user.cart.forEach((item)=>{ cartcount+=1})
    res.render('contact',{req,cartcount})
    }else{
     res.render('contact',{req,cartcount})
    }
});

router.get('/cart',  isloggedin,checkuser ,async function(req, res) {
  var cartcount=0
   const user = await userModel.findOne({ email: req.user.email })
   .populate({
     path: 'cart.product',  
     model: 'Products'      
   });
   const limit=req.flash("limit")
  
   var carttotal=0;
   var cartcount=0
   user.cart.forEach((item)=>{ carttotal+=item.product.price*item.quantity 
      cartcount+=1
   })
   
   res.render('shoping_cart',{req,user,carttotal,cartcount,limit})
});


module.exports = router;