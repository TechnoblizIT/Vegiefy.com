const express = require('express');
const router=express.Router();



// Define the routes

router.get('/login', function(req, res) {
    res.render("delivery-loginpage")
});

router.get("/dashboard", function(req, res) {
    const googlemapapi=process.env.API_KEY
    res.render("order-detailspage",{googlemapapi}) 
})


module.exports = router;