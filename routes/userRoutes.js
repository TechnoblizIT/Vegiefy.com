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
const { body, validationResult } = require("express-validator");
const axios = require("axios");
const ordersModel = require('../models/orders-model');
const counterModel = require('../models/counter-model');
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
router.get("/quantity/inc/:cartItemId", isloggedin, checkuser, async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email }).populate({
      path: 'cart.product',
      model: 'Products'
    });

    const cartItem = user.cart.id(req.params.cartItemId); // find cart item by cartItemId directly

    if (cartItem) {
      if (cartItem.quantity === 0.5) {
        cartItem.quantity = 0.75;
      } else if (cartItem.quantity === 0.75) {
        cartItem.quantity = 1;
      } else if (cartItem.quantity >= 1 && cartItem.quantity < 5) {
        cartItem.quantity += 1;
      } else if (cartItem.quantity === 5) {
        req.flash("limit", "Maximum quantity is 5 Kg");
      }
      await user.save();
    }

    res.redirect("/cart");

  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/quantity/dec/:cartItemId", isloggedin, checkuser, async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email }).populate({
      path: 'cart.product',
      model: 'Products'
    });

    const cartItem = user.cart.id(req.params.cartItemId); // find by cart item's own ID

    if (cartItem) {
      if (cartItem.product.quantitySelector === "Kg") {
        if (cartItem.quantity === 0.5) {
          req.flash("limit", "Minimum quantity is 0.5 Kg");
        } else if (cartItem.quantity === 0.75) {
          cartItem.quantity = 0.5;
        } else if (cartItem.quantity === 1) {
          cartItem.quantity = 0.75;
        } else if ([2, 3, 4, 5].includes(cartItem.quantity)) {
          cartItem.quantity -= 1;
        }
      } else { // for Pc (piece)
        if (cartItem.quantity === 1) {
          req.flash("limit", "Minimum quantity is 1 Pc");
        } else if (cartItem.quantity === 2) {
          cartItem.quantity = 1;
        } else if (cartItem.quantity === 3) {
          cartItem.quantity = 2;
        } else if ([4, 5, 6, 7].includes(cartItem.quantity)) {
          cartItem.quantity -= 1;
        }
      }

      await user.save();
    }

    res.redirect("/cart");

  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

   

   router.post("/order/confirm", async function (req, res) {
    try {
      const { userId, addressId, products, totalPrice } = req.body;
  
      // Validate request data
      if (!userId || !addressId || !products || products.length === 0 || !totalPrice) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      } 
      console.log(addressId)
  
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
        const product = await productModel.findById(item.productId,);
       
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
      const Addressname=`${user.address[addressId].name}`
      const AddressMobile=`${user.address[addressId].mobile}`
      const Address=`${user.address[addressId].address} ${user.address[addressId].locality} ${user.address[addressId].city} ${user.address[addressId].state} ${user.address[addressId].pincode}`;
      
      var counter=await counterModel.findOne({id:"orderid"})
      if (!counter) {
  
        counter = await counterModel.create({ id: 'orderId', seq: 499 });
      }
      counter = await counterModel.findOneAndUpdate(
        { id: 'orderId' },
        { $inc: { seq: 1 } },
        { new: true }
      );

      // Create the new order
      const newOrder = new ordersModel({
        orderid: `#OD-VO-${counter.seq}`,
        AddressIndex:addressId,
        Addressname:Addressname,
        Addressmobile:AddressMobile,
        Address:Address,
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
  

  router.post(
    "/contactus",
    [
      body("name").notEmpty().withMessage("Name is required"),
      body("email").isEmail().withMessage("Valid email is required"),
      body("subject").notEmpty().withMessage("Subject is required"),
      body("message").notEmpty().withMessage("Message is required"),
      body("g-recaptcha-response").notEmpty().withMessage("reCAPTCHA verification is required"),
    ],
    async function (req, res) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render("contact", { errors: errors.array() });
      }
  
      try {
        const { name, email, subject, message, "g-recaptcha-response": recaptchaToken } = req.body;
  
        // Verify reCAPTCHA with Google
        const secretKey = process.env.RECAPTCHA_SECRET_KEY; // Store in .env
        const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;
  
        const response = await axios.post(verificationURL);
        if (!response.data.success) {
          return res.render("contact", { errors: [{ msg: "reCAPTCHA verification failed. Please try again." }] });
        }
  
        // Save query to database
        const newQuery = new queryModel({
          name,
          email,
          subject,
          message,
          date: Date.now(),
        });
        await newQuery.save();
  
        // Setup Nodemailer
        let transporter = nodemailer.createTransport({
          host: "smtpout.secureserver.net",
          port: 587,
          secure: false,
          auth: {
            user: "support@vegiefy.com",
            pass: process.env.MAIL_PASS,
          },
        });
  
        // Email to user
        let mailOptionsUser = {
          from: "support@vegiefy.com",
          to: email,
          subject: "Vegiefy Organics Farming - Query Received",
          html: `
          <p>Dear <strong>${name}</strong>,</p>
          <p>Thank you for reaching out to <strong>Vegiefy Organics Farming</strong>. We have received your query and will get back to you within <strong>24-48 hours</strong>.</p>
          <p>Here are the details of your query:</p>
          <ul>
            <li><strong>Name:</strong> ${name}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Subject:</strong> ${subject}</li>
            <li><strong>Message:</strong> ${message}</li>
          </ul>
          <p>In the meantime, feel free to explore our <a href="https://vegiefy.com">website</a> for the latest updates.</p>
          <p>Best regards,<br><strong>Vegiefy Organics Farming Support Team</strong></p>
          `,
        };
  
        // Email to support team
        let mailOptionsSupport = {
          from: "support@vegiefy.com",
          to: "support@vegiefy.com",
          subject: "New Query Received - Vegiefy Organics Farming",
          html: `
          <p><strong>New Customer Query Received:</strong></p>
          <ul>
            <li><strong>Name:</strong> ${name}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Subject:</strong> ${subject}</li>
            <li><strong>Message:</strong> ${message}</li>
          </ul>
          <p>Please review and respond accordingly.</p>
          `,
        };
  
        // Send Emails
        await transporter.sendMail(mailOptionsUser);
        await transporter.sendMail(mailOptionsSupport);
  
        console.log("Emails sent successfully!");
  
        res.redirect("/");
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Server Error");
      }
    }
  );
  

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
router.post("/sendotp", function(req, res) {
  const {email}=req.body
  const user = userModel.findOne({ email: email });
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  const otp = Math.floor(1000 + Math.random() * 9000);
  
  const transporter = nodemailer.createTransport({
    host: 'smtpout.secureserver.net', 
    port: 587, 
    secure: false, 
    auth: {
        user: 'support@vegiefy.com', 
        pass: process.env.MAIL_PASS
    }
  });
  const mailOptions = {
    from: 'support@vegiefy.com',
    to: email,
    subject: 'OTP Verification',
    text: `Your OTP is ${otp}. Please use this OTP to verify your email address.`,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log('Error:', error);
    } else {
      console.log('Email sent: ', info.response);
      res.status(200).json({ success: true, message: 'OTP sent successfully' });
    }
  });
  
  
})
router.delete('/delete-address/:userId/:addressId', async (req, res) => {
  const { userId, addressId } = req.params;

  try {
     
      const result = await userModel.updateOne(
          { _id: userId }, // Match the user
          { $pull: { address: { id: addressId } } } // Remove the address with the matching `id`
      );

      if (result.modifiedCount > 0) {
          res.status(200).json({ success: true, message: "Address deleted successfully." });
      } else {
          res.status(404).json({ success: false, message: "Address not found or already deleted." });
      }
  } catch (error) {
      console.error("Error deleting address:", error);
      res.status(500).json({ success: false, message: "An error occurred while deleting the address." });
  }
});
router.put("/edit-address/:addressId",checkuser,isloggedin, async (req, res) => {
  const { addressId } = req.params;
  const updatedAddressData = req.body;


  const userId = req.user._id;
  
  try {
      // Find the user by their ID
      const user = await userModel.findById(userId);

      if (!user) {
          return res.status(404).json({ success: false, message: "User not found" });
      }

      // Find the specific address using addressId
      const addressIndex = user.address.findIndex((addr) => addr.id === addressId);

      if (addressIndex === -1) {
          return res.status(404).json({ success: false, message: "Address not found" });
      }

      // Update the address at the found index
      user.address[addressIndex] = {
          ...user.address[addressIndex],  // Retain existing data
          ...updatedAddressData,  // Update with new data from the request body
      };

      // Save the user document with the updated address
      await user.save();

      res.status(200).json({ success: true, message: "Address updated successfully" });
  } catch (error) {
      console.error("Error updating address:", error);
      res.status(500).json({ success: false, message: "An error occurred" });
  }
});
module.exports = router;