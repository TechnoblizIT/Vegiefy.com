const express = require('express');
const router=express.Router();
const {isloggedin}= require("../middlewares/isloggedin")
const {checkuser}=require("../middlewares/checkUser")
const productModel=require("../models/product-model")
const userModel=require("../models/user-model")
const passport=require("passport")
const GoogleStrategy = require('passport-google-oauth20');
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
   res.render('index',{req,products,cartcount})
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
    res.render('blog',{req,cartcount})
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

router.get("/not-available" ,isloggedin,checkuser ,async function(req, res) {
  var cartcount=0
  if (req.user){
    const user = await userModel.findOne({ email: req.user.email })
    .populate({
      path: 'cart.product',  
      model: 'Products'      
    });
    user.cart.forEach((item)=>{ cartcount+=1})
    res.render('not-available',{req,cartcount})
    }else{
     res.render('not-available',{req,cartcount})
    }
})

router.get("/productdetails/:productid",checkuser,async function(req, res) {
  const product = await productModel.findById(req.params.productid)
  res.render('single-product',{product,req})
})

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

router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
   
    const products = await productModel.find({
      name: { $regex: query, $options: 'i' }
    }).limit(20); 
    res.json(products);
  } catch (err) {
    res.status(500).send('Server error');
  }
});
const jwt = require('jsonwebtoken');
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get('/auth/google/callback', 
  passport.authenticate('google',{ failureRedirect: '/login' ,session:false}),
  async (req, res) => {
    try {
<<<<<<< HEAD
      const token = jwt.sign(req.user.email, process.env.JWT_SECRET);

      
=======
      console.log('Authenticated User:', req.user);
      const token = jwt.sign(req.user.email, process.env.JWT_SECRET);
>>>>>>> 275fd40c7cd3ab504078222c7bde74a183f9f583
      res.cookie('tokken', token);

      res.redirect('/');
    } catch (error) {
      console.error('Error generating JWT:', error);
      res.redirect('/login');
    }
  }
);

module.exports = router;