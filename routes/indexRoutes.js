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
    // Use a case-insensitive search with regular expressions
    const products = await productModel.find({
      name: { $regex: query, $options: 'i' }
    }).limit(10); // Optional: limit the results to 10
    res.json(products); // Send the matching products back as JSON
  } catch (err) {
    res.status(500).send('Server error');
  }
});


module.exports = router;