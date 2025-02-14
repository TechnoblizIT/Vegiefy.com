const express = require('express');
const router=express.Router();
const deliveryboysModel=require("../models/deliveryboydata-model")
const {genrateTokenDelivery}=require("../utils/genrateTokenDelivery")
const { isDeliverylogin } = require('../middlewares/isDeliverylogin');
const {checkDelivery}=require("../middlewares/checkDelivery");
const ordersModel = require('../models/orders-model');

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
    
        deliveryboy.isActive="Online";
        await deliveryboy.save();
        return res.redirect("/delivery/dashboard");
      } catch (err) {
        console.error(err.message);
        
        res.status(500).send("Internal Server Error");
      }   

});
router.post("/update-status",async function(req, res){
  const { userId, status } = req.body;
  const deliveryboy =await deliveryboysModel.findById(userId);
  deliveryboy.isActive=status;
  await deliveryboy.save();
  res.redirect("/delivery/dashboard")
 
})

router.get("/dashboard",isDeliverylogin,checkDelivery ,async function(req, res) {
    const googlemapapi=process.env.API_KEY
    const user=req.user
    const neworder = await ordersModel
    .find({
      status: "Confirmed",
      RejectedBy: { $nin: [req.user._id] } // Exclude orders rejected by this delivery boy
    })
    .populate("Products.product")
    .populate("User");
  
  const rejectedorder=await ordersModel
  .find({RejectedBy: { $in: [req.user._id] }}).populate("Products.product") 
  .populate("User")
  const activeOrder = await ordersModel
  .find({
    status: { $in: ["Processing", "Out For Deliverey"] },
    DeliveryBoy : {$in:[user._id]}
  })
  .populate("Products.product") 
  .populate("User")
   
    const orderhistory = await ordersModel.find( {status: { $in: ["Delivered"] },
      DeliveryBoy : {$in:[user._id]}}).populate("Products.product").populate("User")
    res.render("order-detailspage",{googlemapapi,user,neworder,activeOrder,orderhistory,rejectedorder}) 
})

router.post('/updateOrderStatus', async (req, res) => {
  const { status, orderid } = req.body;

  try {
    const updateData = { status };

    // Set timestamps based on status
    if (status === "Processing") {
      updateData.ProcessingDate = new Date();
    } else if (status === "Out For Deliverey") {
      updateData.OutForDeliveryDate = new Date();
    } else if (status === "Delivered") {
      updateData.DeliveredDate = new Date();
    }

    await ordersModel.updateOne({ orderid }, updateData);
    
    res.redirect('/delivery/dashboard#new-link-content'); // Redirect or respond as needed
  } catch (err) {
    res.status(500).send(err);
  }
});


  router.get("/accept/:id", isDeliverylogin, checkDelivery, async function(req, res) {
    const { id } = req.params;
  
    try {
          const updatedOrder = await ordersModel.findByIdAndUpdate(
        id, 
        { status: "Processing", DeliveryBoy: req.user._id, DeliveryBoyName:req.user.name,ProcessingDate: new Date() }, 
        { new: true }
      );
   
    
      await deliveryboysModel.findByIdAndUpdate(
        req.user._id,
        { $push: { orders: updatedOrder._id } },
        { new: true }
      );
    
   
      res.redirect("/delivery/dashboard");
  
    } catch (err) {
      
      res.status(500).send(err);
    }
  });
  
  router.get("/reject/:id", isDeliverylogin, checkDelivery, async function(req, res) {
    const { id } = req.params;
  
    try {
      await ordersModel.findByIdAndUpdate(id, { RejectedBy:req.user._id}, { new: true });
      res.redirect("/delivery/dashboard");
  }
  catch (err) {
      res.status(500).send(err);
    }})


router.get("/logout",(req, res)=>{
    res.clearCookie("tokken");
    res.redirect("/delivery/login")
})

router.get("/deliverydetails/:id",isDeliverylogin,(req, res)=>{
  const { id } = req.params;
    ordersModel.findById(id).populate("User").populate("Products.product").then((order)=>{
        res.render("new-delivery-detailspage",{order})
    }).catch((err)=>{
        console.error(err)
        res.status(500).send("Error getting deliveryboy details")
    })
})


module.exports = router;