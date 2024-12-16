const express = require('express');
const router=express.Router();
const deliveryboysModel=require("../models/deliveryboydata-model")
const {genrateTokenDelivery}=require("../utils/genrateTokenDelivery")
const { isDeliverylogin } = require('../middlewares/isDeliverylogin');
const {checkDelivery}=require("../middlewares/checkDelivery")

// Define the routes

router.get('/login', function(req, res) {
    
    res.render("delivery-loginpage")
});

router.post('/login', async function(req, res) {
    try {
        let { username, password } = req.body;
        const deliveryboy = await deliveryboysModel.findOne({ username: username });
    
        
        if (!deliveryboy) {
          req.flash("error", "Email or password incorrect");
          return res.redirect("/delivery/login"); 
        }
    
      
        
        if (password!==deliveryboy.password) {
          req.flash("error", "Email or password incorrect");
          return res.redirect("/delivery/login"); 
        }
    
        
        const tokken = genrateTokenDelivery(deliveryboy);
        res.cookie("tokken", tokken);
    
        
        return res.redirect("/delivery/dashboard");
      } catch (err) {
        console.error(err.message);
        // Optionally handle error response here
        res.status(500).send("Internal Server Error");
      }   

});


router.get("/dashboard",isDeliverylogin,checkDelivery ,function(req, res) {
    const googlemapapi=process.env.API_KEY
    const user=req.user
    res.render("order-detailspage",{googlemapapi,user}) 
})

router.get("/logout",(req, res)=>{
    res.clearCookie("tokken");
    res.redirect("/delivery/login")
})


module.exports = router;