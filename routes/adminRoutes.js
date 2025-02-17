const express = require('express');
const router=express.Router();
const {registerAdmin,loginAdmin}=require("../controllers/adminAuthController");
const { render } = require('ejs');
const upload =require("../configs/multer-setup")
const productModel=require("../models/product-model");
const deliveryboyModel=require("../models/deliveryboydata-model")
const { isloggedin } = require('../middlewares/isloggedin');
const {adminLogin}=require("../middlewares/isAdminlogin")
const {isAdmin}=require("../middlewares/isAdmin")
const nodemailer = require("nodemailer")
const orderModel=require("../models/orders-model");
const userModel = require('../models/user-model');
const quantityModel = require("../models/user-query");
const CategoryModel = require('../models/Category-model');
router.get("/login", function(req, res){
    res.render("admin-login")
})


router.get("/register",registerAdmin)

router.post("/login",loginAdmin)

router.get("/logout",(req, res)=>{
    res.clearCookie("tokken");
    res.redirect("/admin/login")
})
router.get("/dashboard",isAdmin,adminLogin, async function(req, res){
  const category=await CategoryModel.find()
  console.log(category)
    const products=await productModel.find()
    const deliveryBoys=await deliveryboyModel.find()
    const orders=await orderModel.find().populate("Products.product").populate("User").populate("DeliveryBoy")
    const queries=await quantityModel.find()
    var totalprice=0
    
   
  const activeOrder = await orderModel
  .find({
    status: { $in: ["Confirmed","Processing", "Out For Deliverey"] }
  })
  .populate("Products.product") 
  .populate("User")
   orders.forEach(item=>{
    totalprice=totalprice+item.TotalPrice
       })

  var itemsold=0

    const activeorderscount=activeOrder.length
    products.forEach(product=>{
       itemsold=itemsold+product.unitsold
      
    })
    res.render("product-admin",{products,deliveryBoys,orders,activeorderscount,itemsold,totalprice,queries,category})
  })

router.get("/addproduct",isloggedin,function(req, res){
    res.render("admin_addProduct")
})


router.post("/addproduct", upload.single("file"), async function (req, res) {
  try {
    let { productname, description, price, category, expiredate, instock, description2 } = req.body;

    // Create and save the new product
    const newProduct = new productModel({
      name: productname,
      description,
      description2,
      price,
      image: {
        file: req.file.buffer,
        imageType: req.file.mimetype,
      },
      category,
      expirydate: new Date(expiredate),
      instock,
    });

    const savedProduct = await newProduct.save();

   
    await CategoryModel.findOneAndUpdate(
      { _id: category },
      { $push: { product: savedProduct._id } },
      { new: true, useFindAndModify: false }
    );

    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/updateproduct",upload.single("productimage"),async function(req, res){
  let { productid, productname, productdescription,productdescription2, productcategory, productexpiredate, productinstock } = req.body;

  if(req.file){
    const updatedProduct = await productModel.findByIdAndUpdate(productid, {
      name: productname,
      description: productdescription,
      description2:productdescription2,
      image:{
        file:req.file.buffer,
        imageType:req.file.mimetype,
      },
      category:productcategory,
      expirydate: new Date(productexpiredate),
      productinstock,
    }, { new: true });
  }else{
    const updatedProduct = await productModel.findByIdAndUpdate(productid, {
      name: productname,
      description:productdescription,
      category:productcategory,
      expirydate: new Date(productexpiredate),
      instock:productinstock,
    }, { new: true });
  }
  
    res.redirect("/admin/dashboard")
})
router.delete('/products/delete', async (req, res) => {
  const { productIds } = req.body; 
  try {
      await productModel.deleteMany({ _id: { $in: productIds } });
      await userModel.updateMany(
        { 'cart.product': { $in: productIds } },
        { $pull: { cart: { product: { $in: productIds } } } }
      );
      await deliveryboyModel.updateMany(
        { 'orders.products.product': { $in: productIds } },
        { $pull: { orders: { products: { product: { $in: productIds } } } } }
      );
      await orderModel.updateMany(
        { 'products.product': { $in: productIds } },
        { $pull: { products: { product: { $in: productIds } } } }
      );
      await CategoryModel.updateMany(
        { product: { $in: productIds } },
        { $pull: { product: { $in: productIds } } }
      );
      res.status(200).send({ message: 'Selected products deleted successfully' });
  } catch (err) {
      res.status(500).send({ error: 'Failed to delete products' });
  }
});
  router.get("/getproduct/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const product = await productModel.findById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    }catch(e){
      console.error(e);
      res.status(500).json({ message: "Internal Server Error" });
    }
  })
  router.get("/getorder/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const order = await orderModel.findById(id).populate("Products.product") 
      .populate("User")
     .populate("DeliveryBoy");
     console.log(order)
      if (!order) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(order);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Internal Server Error" });
    }

  })



  router.post(
    "/create-deliveryboy",
    upload.single("profile"),
    async function (req, res) {
      try {
   
        const { name, phone, email, joindate, username, password } = req.body;
  
     
        if (!name || !phone || !email || !joindate ||  !username || !password) {
          return res.status(400).send("All fields are required.");
        }
           
        if (!req.file) {
          return res.status(400).send("profile image uploads are required.");
        }
  
        
       
        const newDeliveryboy = new deliveryboyModel({
          name,
          mobile:phone,
          email,
          username,
          password,
          joiningDate: joindate,
          profileimage: {
            file:req.file.buffer,
            filetype: req.file.mimetype,
          },
        });

        // Save to database
        await newDeliveryboy.save();
  
        // Sending email
        let transporter = nodemailer.createTransport({
          host: "smtpout.secureserver.net",
          port: 587,
          secure: false,
          auth: {
            user: "support@vegiefy.com",
            pass: process.env.MAIL_PASS,
          },
        });
  
        let mailOptions = {
          from: "support@vegiefy.com",
          to: req.body.email,
          subject: "Welcome to Vegiefy Organics Farming - Your Account Details",
          text: `Dear ${req.body.name},
  
  Welcome to the Vegiefy Organics Farming team! We are thrilled to have you onboard as our new delivery boy.
  
  Below are your login credentials to access our system:
  
  Username: ${newDeliveryboy.username}
  Password: ${newDeliveryboy.password}
  
  Please log in and change your password upon first use to ensure account security. If you encounter any issues or have questions, feel free to reach out to support@vegiefy.com.
  
  We’re looking forward to a great journey together!
  
  Best regards,
  Vegiefy Organics Farming`,
        };
  
        try {
          await transporter.sendMail(mailOptions);
        } catch (mailError) {
          console.error("Error sending email:", mailError);
          return res.status(500).send("Delivery boy created, but email could not be sent.");
        }
  
        // Redirect to dashboard if everything succeeds
        res.redirect("/admin/dashboard");
      } catch (error) {
        console.error("Error creating delivery boy:", error);
  
        if (error.name === "ValidationError") {
          return res.status(400).send("Invalid data: " + error.message);
        }
  
        res.status(500).send(
          "An error occurred while creating the delivery boy. Please try again later."
        );
      }
    }
  );

  router.get('/delete-deliveryboy/:id', async function (req, res) {
    try {
      const { id } = req.params;
      const deletedDeliveryboy = await deliveryboyModel.findByIdAndDelete(id);
      if (!deletedDeliveryboy) {
        return res.status(404).json({ message: "Delivery boy not found" });
      }
      res.redirect("/admin/dashboard")
    
    }catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  })
  router.get("/update-deliveryboy",async function (req, res) {
    try {
      const { username, name, mobile, email, joiningDate } = req.body;
      const updatedDeliveryboy = await deliveryboyModel.findByIdAndUpdate(deliveryboyid, {
        name: name,
        mobile: mobile,
        email: email,
        joiningDate: joiningDate,
        username: username,
      }, { new: true });
    }
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  })
  router.patch('/toggle-product/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
  
      const product = await productModel.findByIdAndUpdate(id, { isActive }, { new: true });
  
      if (!product) return res.status(404).json({ error: 'Product not found' });
  
      res.json({ message: 'Product updated successfully', product });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  router.get("/getuser/:userid", async (req, res) => {
    const { userid } = req.params;
   
    try{
      const user = await deliveryboyModel.findById(userid);
    
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    }
  catch(error){
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }})

    router.post("/add-category", async (req, res) => {
      try {
          const { name, description } = req.body;
  
          if (!name) {
              return res.status(400).json({ error: "Category name is required" });
          }
  
          const newCategory = new CategoryModel({ name, description });
          await newCategory.save();
  
          res.status(201).json({ message: "Category added successfully", category: newCategory });
      } catch (error) {
          res.status(500).json({ error: "Internal Server Error", details: error.message });
      }
  });
module.exports = router;