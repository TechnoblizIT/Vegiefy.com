const express = require('express');
const router=express.Router();
const {registerUser,loginUser,logoutUser}=require("../controllers/authController")
const {checkuser}= require("../middlewares/checkUser")
const{isloggedin}=require("../middlewares/isloggedin")
const userModel=require("../models/user-model")
const orderMoel=require("../models/orders-model")
const nodemailer=require("nodemailer");
const queryModel=require("../models/user-query")
// Define the routes


router.post('/create', registerUser);

router.post('/login', loginUser);

router.get('/logout', logoutUser);

router.get('/profile',checkuser,isloggedin, (req,res)=>{
    res.render("new-profilepage",{req})
});

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
   


router.post("/createOrder",isloggedin,checkuser, async function(req, res) {

const user = await userModel.findOne({ email: req.user.email }).populate("cart")
var carttotal=0;
var cartcount=0
const products=[]
user.cart.forEach((item)=>{ carttotal+=item.price 
   cartcount+=1
   products.push(item.name)
})
const total_price=carttotal-carttotal/100*3
const newOrder = new orderMoel({
    Name: req.body.name,
    Date: Date.now(),
    Address: req.body.address,
    Products: user.cart,
    TotalPrice: total_price,
    Phone: req.body.phone

})
await newOrder.save()
user.cart=[]
await user.save()
console.log(newOrder)
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
    subject: 'Order Confirmation - Vegiefy Organics Farming',
    text: `Dear ${req.body.name},

Thank you for your order with Vegiefy Organics Framing. We are pleased to inform you that your order has been successfully placed.

Order Details:
- Order ID: ${newOrder._id}
- Total Amount: ₹${total_price}
- Products Ordered: ${products}
- Delivery Time: Within 2-3 hours

We will notify you once your order is out for delivery. Should you have any questions or need further assistance, please do not hesitate to contact our support team at support@vegiefy.com.

Thank you for choosing Vegiefy Organics. We look forward to serving you again!

Best regards,
Vegiefy Organics Farming
Customer Support Team
`
};

let mailOptions2 = {
    from: 'support@vegiefy.com',
    to: 'support@vegiefy.com', 
    subject: 'New Order Received - Order ID: ' + newOrder._id,
    text: `Hello Support Team,

A new order has been placed on Vegiefy Organics. Below are the details:

Order Details:
- Order ID: ${newOrder._id}
- Customer Name: ${req.body.name}
- Delivery Address: ${req.body.address}
- Products Ordered: ${products}
- Customer Mobile: ${req.body.phone}
- Total Amount: ₹${total_price}

Please ensure timely processing and delivery of this order.

Best regards,
Vegiefy Organics Farming
Order Management Team
`
};



transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log('Error:', error);
    } else {
        console.log('Customer Email sent: ' + info.response);
    }
});


transporter.sendMail(mailOptions2, function(error, info){
    if (error) {
        console.log('Error:', error);
    } else {
        console.log('Support Email sent: ' + info.response);
    }
});

res.redirect("/")
})

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
    user.address.name = name;
    user.address.mobile = mobile;
    user.address.pincode = pincode;
    user.address.locality = locality;
    user.address.address = address;
    user.address.city = city;
    user.address.state = state;
    user.address.landmark = landmark;
    user.address.alternatemobile = alternatemobile;
    user.address.addressType = addresstype;
    await user.save();
    res.redirect("/user/profile")
    console.log(user.address)
})

module.exports = router;