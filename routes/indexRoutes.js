const express = require('express');
const router=express.Router();
const {isloggedin}= require("../middlewares/isloggedin")
const {checkuser}=require("../middlewares/checkUser")

// Define the routes

router.get('/',checkuser ,function(req, res) {
   res.render('index',{req})
});

router.get('/login', function(req, res) {
   const errors=req.flash("error")
    res.render('login',{errors})
 });

 router.get('/product', checkuser ,function(req, res) {
   res.render('product',{req})
});

router.get('/contact', checkuser ,function(req, res) {
   res.render('contact',{req})
});


module.exports = router;