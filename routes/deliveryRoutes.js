const express = require('express');
const router=express.Router();



// Define the routes

router.get('/login', function(req, res) {
    res.render("delivery-loginpage")
});

router.get("/dashboard", function(req, res) {
    res.render("order-detailspage") 
})


module.exports = router;