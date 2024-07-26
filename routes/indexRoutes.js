const express = require('express');
const router=express.Router();
const {isloggedin}= require("../middlewares/isloggedin")
const {checkuser}=require("../middlewares/checkUser")

// Define the routes

router.get('/',checkuser ,function(req, res) {
   res.render('index',{req})
});

router.get('/login', function(req, res) {
    res.render('login')
 });


module.exports = router;