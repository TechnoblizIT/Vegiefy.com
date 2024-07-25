const express = require('express');
const router=express.Router();


// Define the routes

router.get('/', function(req, res) {
   res.render('index')
});

router.get('/login', function(req, res) {
    res.render('login')
 });


module.exports = router;