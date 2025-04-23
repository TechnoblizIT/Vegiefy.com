const express = require('express');
const router=express.Router();
const {isloggedin}= require("../middlewares/isloggedin")
const {checkuser}=require("../middlewares/checkUser")
const productModel=require("../models/product-model")
const categoryModel=require("../models/Category-model")
const userModel=require("../models/user-model")
const passport=require("passport")
const GoogleStrategy = require('passport-google-oauth20');
const {genrateToken} = require("../utils/generateToken")

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
   user.cart = user.cart.filter(item => item.product !== null);
   user.cart = user.cart.filter((item) => item.product && item.product.isActive)
   cartcount = user.cart.length;
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
    const products=await productModel.find({isActive: true })
    const category=await categoryModel.find();
    if (req.user){
   const user = await userModel.findOne({ email: req.user.email })
   .populate({
     path: 'cart.product',  
     model: 'Products'      
   });
   var cartcount=0
   user.cart = user.cart.filter(item => item.product !== null);
   user.cart = user.cart.filter((item) => item.product && item.product.isActive);
   cartcount = user.cart.length;
   res.render('product',{products,req,cartcount,category})}
   else{
    res.render('product',{products,req,cartcount,category})

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
    user.cart = user.cart.filter(item => item.product !== null);
    user.cart = user.cart.filter((item) => item.product && item.product.isActive);
    cartcount = user.cart.length;
    res.render('blog',{req,cartcount})
    }else{
     res.render('blog',{req,cartcount})
    }
 });

 router.get('/delivery',isloggedin, checkuser ,async function(req, res) {
  var cartcount=0
   const user = await userModel.findOne({ email: req.user.email })
   .populate({
     path: 'cart.product',  
     model: 'Products'      
   });
   const orders = await ordersModel.find({ User: req.user._id }) // Fetch orders for a specific user
   .populate('User')
   .populate({
     path: 'Products.product',
     model: 'Products',
   })
   .populate('DeliveryBoy');
   var cartcount=0
   user.cart = user.cart.filter(item => item.product !== null);
   user.cart = user.cart.filter((item) => item.product && item.product.isActive);
   cartcount = user.cart.length;
   res.render('deliverypage',{req,cartcount,orders})
  
  
});

 router.get('/contact', checkuser ,async function(req, res) {
  var cartcount=0
  if (req.user){
    const user = await userModel.findOne({ email: req.user.email })
    .populate({
      path: 'cart.product',  
      model: 'Products'      
    });

    user.cart = user.cart.filter(item => item.product !== null);
    user.cart = user.cart.filter((item) => item.product && item.product.isActive);
    cartcount = user.cart.length;
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
    user.cart = user.cart.filter(item => item.product !== null);
    user.cart = user.cart.filter((item) => item.product && item.product.isActive);
    cartcount = user.cart.length;
    res.render('not-available',{req,cartcount})
    }else{
     res.render('not-available',{req,cartcount})
    }
})

router.get("/productdetails/:productid",checkuser,async function(req, res) {
  var cartcount=0
  if (req.user){
    const user = await userModel.findOne({ email: req.user.email })
    .populate({
      path: 'cart.product',  
      model: 'Products'      
    });
  
    user.cart = user.cart.filter(item => item.product !== null);
    user.cart = user.cart.filter((item) => item.product && item.product.isActive);
    cartcount = user.cart.length;
  }
  const product = await productModel.findById(req.params.productid)
  res.render('single-product',{product,req,cartcount});
})

router.get('/cart', isloggedin, checkuser, async function (req, res) {
  try {
    let cartcount = 0;
    const user = await userModel
      .findOne({ email: req.user.email })
      .populate({
        path: 'cart.product',
        model: 'Products',
      });

    // Check if the user exists and has a cart
    if (!user || !user.cart) {
      req.flash('error', 'User not found or cart is empty');
      return res.redirect('/'); // Redirect to home or any other appropriate page
    }

    const limit = req.flash('limit') || null;

    let carttotal = 0;
    cartcount = 0;
    user.cart = user.cart.filter((item) => item.product && item.product.isActive);

    user.cart.forEach((item) => {
      if (item.product && item.product.price) {
        carttotal += item.product.price * item.quantity;
        cartcount += 1;
      }
    });

    res.render('shoping_cart', { req, user, carttotal, cartcount, limit });
  } catch (error) {
    console.error('Error fetching cart:', error); // Log the error for debugging
    req.flash('error', 'Something went wrong while fetching the cart');
    res.status(500).redirect('/'); // Redirect with an error status
  }
});

router.get("/forgotpasswords", function(req, res) {
  res.render('forgotpass');
})



router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
   console.log(query)
    const products = await productModel.find({
      name: { $regex: query, $options: 'i' },
      isActive: true,
    }).limit(20); 
    const category = await categoryModel.find();
    res.json(products,category);
  } catch (err) {
    res.status(500).send('Server error');
  }
});
const jwt = require('jsonwebtoken');
const ordersModel = require('../models/orders-model');
const CategoryModel = require('../models/Category-model');





router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get('/auth/google/callback', 
  passport.authenticate('google',{ failureRedirect: '/login' ,session:false}),
  async (req, res) => {
    try {
      const token = genrateToken(req.user)

      
      res.cookie('token', token);

      res.redirect('/');
    } catch (error) {
      console.error('Error generating JWT:', error);
      res.redirect('/login');
    }
  }
);
router.get("/terms&conditions",function (req, res) {
  res.render('terms&conditions');
})
router.get("/productsearch",checkuser,async function(req, res) {
    const query = req.query.q;
    
    const products=await productModel.find({ name: { $regex: query, $options: 'i' },isActive:true}).limit(2);
    const category=await categoryModel.find();
    if (req.user){
      const user = await userModel.findOne({ email: req.user.email })
      .populate({
        path: 'cart.product',  
        model: 'Products'      
      });
      var cartcount=0
      user.cart = user.cart.filter(item => item.product !== null);
      user.cart = user.cart.filter((item) => item.product && item.product.isActive);
      cartcount = user.cart.length;
      
      res.render('product',{products,req,cartcount,category})
    }
      else{
      res.render('product',{products,req,cartcount,category})
  
      }
  });
  router.get("/products/:category", async (req, res) => {
    try {
      const { category } = req.params;
      let products;
  
      if (category === "all") {
        products = await productModel.find({});
      } else {
        products = await productModel.find({ category: category });
      }
      res.json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  
  module.exports = router;


