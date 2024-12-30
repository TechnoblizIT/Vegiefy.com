const express = require('express');
const router=express.Router();
const {registerUser,loginUser,logoutUser}=require("../controllers/authController")
const {checkuser}= require("../middlewares/checkUser")
const{isloggedin}=require("../middlewares/isloggedin")
const userModel=require("../models/user-model")
const orderMoel=require("../models/orders-model")
const nodemailer=require("nodemailer");
const queryModel=require("../models/user-query");
const productModel = require('../models/product-model');
const ordersModel = require('../models/orders-model');
// Define the routes


router.post('/create', registerUser);

router.post('/login', loginUser);

router.get('/logout', logoutUser);

router.get('/profile',isloggedin,checkuser, (req,res)=>{
    res.render("new-profilepage",{req})
});

router.post('/update-profile',isloggedin,checkuser,async (req,res)=>{
    
    const user=await userModel.findOne({email:req.user.email});
    user.name=req.body.fullName
    user.email=req.body.email
    user.mobile=req.body.phone
    await user.save()
    res.redirect("/user/profile")
})









router.post("/addtocart/:productid",isloggedin, checkuser,async(req,res)=>{
    const user=await userModel.findOne({email:req.user.email});
    const quantity = req.body.quantity; 
    user.cart.push({ product: req.params.productid, quantity: quantity });
    await user.save();
    res.redirect("/product")
});


router.get("/removeitem/:productid", isloggedin, checkuser, async (req, res) => {
    const user = await userModel.findOne({ email: req.user.email })
    user.cart = user.cart.filter(item => item._id.toString() !== req.params.productid);

    await user.save();
    res.redirect("/cart");
});
router.get("/quantity/inc/:productid", isloggedin, checkuser, async (req, res)=>{
 const user = await userModel.findOne({ email: req.user.email }).populate({
    path: 'cart.product',  
    model: 'Products'      
  });
  console.log(user);

 user.cart.forEach((item)=>{
   if(item.product._id.toString()===req.params.productid){
   
    if(item.quantity===0.5){
        item.quantity=0.75
        item.product.price=item.quantity*item.product.price
    }
    if(item.quantity===0.75){
        item.quantity=1
        item.product.price=item.quantity*item.product.price
    }
    if(item.quantity===1||item.quantity===2 || item.quantity===3 || item.quantity===4){
        item.quantity+=1
        item.product.price=item.quantity*item.product.price
    }
    if(item.quantity===5){
        req.flash("limit","Maximum quantity is 5 Kg")
    }
   }
 })
 await user.save()

 res.redirect("/cart")
})
router.get("/quantity/dec/:productid", isloggedin, checkuser, async (req, res)=>{
    const user = await userModel.findOne({ email: req.user.email }).populate({
       path: 'cart.product',  
       model: 'Products'      
     });
   
    user.cart.forEach((item)=>{
      if(item.product._id.toString()===req.params.productid){
       if(item.quantity===0.5){
        req.flash("limit","Minimum quantity is 0.5 Kg")
       }
       if(item.quantity===0.75){
           item.quantity=0.5
           item.product.price=item.quantity*item.product.price
       }
       if(item.quantity===1){
        item.quantity=0.75
           item.product.price=item.quantity*item.product.price
       }
       if(item.quantity===2 || item.quantity===3 || item.quantity===4 || item.quantity===5){
           item.quantity-=1
           item.product.price=item.quantity*item.product.price
       }
      }
    })
    await user.save()
   
    res.redirect("/cart")
   })
   

   router.post("/order/confirm", async function (req, res) {
    try {
      const { userId, addressId, products, totalPrice } = req.body;
  
      // Validate request data
      if (!userId || !addressId || !products || products.length === 0 || !totalPrice) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }
  
      // Check if the user exists
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      const validPincodes = [441601, 441614, 441801];
      let isValidPincode = false;
  
      // Loop through the user's addresses
      user.address.forEach(addr => {
        console.log("Checking pincode:", addr.pincode);
        if (validPincodes.includes(Number(addr.pincode))) {
          isValidPincode = true;
        }
      });
  
      console.log("Is valid pincode:", isValidPincode);
      if (!isValidPincode) {
        return res.status(400).json({
          success: false,
          redirect: '/not-available',
          message: 'Delivery not available in your area.',
        });
      }
  
      // Validate all products and their stock
      for (const item of products) {
        const product = await productModel.findById(item.productId);
        if (!product) {
          return res.status(404).json({ success: false, message: `Product not found for ID: ${item.productId}` });
        }
        if (product.instock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for product: ${product.name}`,
          });
        }
  
        // Deduct stock
        product.instock -= item.quantity;
        product.unitsold += item.quantity;
        await product.save();
      }
  
      const orderItems = user.cart.map(item => ({
        product: item.product._id, // product ID
        quantity: item.quantity // quantity of the product
      }));
  
      // Create the new order
      const newOrder = new ordersModel({
        orderid: `OD-VO${Date.now()}`,
        AddressIndex:addressId,
        Date: new Date(),
        User: userId,
        Products: orderItems,
        TotalPrice: totalPrice,
        status: 'Confirmed',
      });
  
      // Save the order
      await newOrder.save();
  
      // Send confirmation email
      let transporter = nodemailer.createTransport({
        host: 'smtpout.secureserver.net',
        port: 587,
        secure: false,
        auth: {
          user: 'support@vegiefy.com',
          pass: process.env.MAIL_PASS,
        },
      });
  
      const mailOptions = {
        from: 'support@vegiefy.com',
        to: user.email,
        subject: "Order Confirmation",
        text: `
          Order Confirmation
      
          Dear ${user.name},
      
          Thank you for shopping with Vegiefy Organics Farming! We're excited to confirm your order.
      
          Order Details:
          ------------------------
          Order ID: ${newOrder.orderid}
          Total Amount: ₹${totalPrice.toFixed(2)}
      
          We are processing your order and will notify you once it is shipped.
      
          If you have any questions or need assistance, please feel free to contact our support team at support@vegiefy.com.
      
          Thank you for choosing Vegiefy!
      
          Best Regards,
          Vegiefy Team
      
          Visit Vegiefy: https://vegiefy.com
          Contact Us: support@vegiefy.com
        `,
      };
  
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log('Error:', error);
        } else {
          console.log('Email sent: ', info.response);
        }
      });
  
      // Empty the user's cart
      user.cart = [];
      await user.save();
  
      // Respond with success
      res.status(200).json({
        success: true,
        message: 'Order confirmed and cart emptied',
        orderId: newOrder._id,
      });
    } catch (error) {
      console.error('Error confirming order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to confirm order. Please try again.',
      });
    }
  });
  

router.post("/contactus", async function(req, res){
    console.log("heelp")
    const newQuery = new queryModel({
        name: req.body.name,
        email: req.body.email,
        subject: req.body.subject,
        message: req.body.message,
        date: Date.now()
    })
   await newQuery.save()
   let transporter = nodemailer.createTransport({
    host: 'smtpout.secureserver.net', 
    port: 587, 
    secure: false, 
    auth: {
        user: 'support@vegiefy.com', 
        pass: process.env.MAIL_PASS
    }
});

let mailOptions = {
    from: 'support@vegiefy.com',
    to: req.body.email, 
    subject: 'Vegiefy Organics Farming - Query Received',
    text: `Dear ${req.body.name},

Thank you for reaching out to Vegiefy Organics Farming. We have received your query and will get back to you shortly.`
}
let mailOptions2 = {
    from: 'support@vegiefy.com',
    to: "support@vegiefy.com", 
    subject: 'Vegiefy Organics Farming - Query',
    text: `New Query Received:

Name: ${req.body.name}
Email: ${req.body.email}
Subject: ${req.body.subject}
Message: ${req.body.message}

Please check our website for updates on our products and services.`
}


transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log('Error:', error);
    } else {
        console.log('Email sent: ', info.response);
    }
    
})
transporter.sendMail(mailOptions2, function(error, info){
    if (error) {
        console.log('Error:', error);
    } else {
        console.log('Support Email sent: ', info.response);
    }

})
res.redirect("/")
})

router.post('/update-profile',isloggedin,checkuser, async(req, res) => {
const { fullname, phone, email } = req.body;
const user=await userModel.findOne({ email: req.user.email }); 
user.name = fullname;
user.email = email;
user.mobile = phone;

await user.save();

res.redirect("/user/profile")

});

router.post("/saveaddress",isloggedin,checkuser, async(req, res) => {
    const { name, mobile, pincode, locality, address, city, state, landmark, alternatemobile, addresstype } = req.body;
    const user=await userModel.findOne({ email: req.user.email }); 
    const randomId = Math.floor(100000 + Math.random() * 900000);
    user.address.push({
        id:randomId,
        name,
        mobile,
        pincode,
        locality,
        address,
        city,
        state,
        landmark,
        alternatemobile,
        addressType: addresstype
    });
    await user.save();
    res.redirect("/user/profile")

})

module.exports = router;