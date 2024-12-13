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

router.get("/login", function(req, res){
    res.render("admin-login")
})


router.get("/register",registerAdmin)

router.post("/login",loginAdmin)

router.get("/logout",(req, res)=>{
    res.clearCookie("tokken");
    res.redirect("/admin/login")
})
router.get("/dashboard",isAdmin,adminLogin,async function(req, res){
    const products=await productModel.find()
    
    res.render("product-admin",{products})
})

router.get("/addproduct",isloggedin,function(req, res){
    res.render("admin_addProduct")
})

router.post("/addproduct",upload.single("file"),async function(req, res){
    let {productname, description, price ,category,expiredate,instock} = req.body;
    const newProduct = new productModel({
      name:productname,
      description,
      price,
      image:{
        file:req.file.buffer,
        imageType:req.file.mimetype,
      },
      category,
      expirydate:new Date(expiredate),
      instock,
      
    }
    )
  
    await newProduct.save();
   res.redirect("/admin/dashboard")

})
router.delete("/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
  
      const deletedProduct = await productModel.findByIdAndDelete(id);
      if (!deletedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      res.status(200).json({ message: "Product deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  router.post("/create-deliveryboy", upload.single("idproofupload"), async function (req, res) {
    try {
      const { name, phone, email, joindate, idproof, username, password } = req.body;
  
      
      if (!name || !phone || !email || !joindate || !idproof || !username || !password) {
        return res.status(400).send("All fields are required.");
      }
  
      
      if (!req.file) {
        return res.status(400).send("ID proof upload is required.");
      }
  
      // Create new delivery boy instance
      const newDeliveryboy = new deliveryboyModel({
        name,
        phone,
        email,
        username,
        password,
        IDproof: idproof,
        joiningDate: joindate,
        IDupload: {
          file: req.file.buffer,
          imageType: req.file.mimetype,
        },
      });
  
      // Save to database
      await newDeliveryboy.save();
  
     
      res.redirect("/admin/dashboard");
    } catch (error) {
      console.error("Error creating delivery boy:", error);
  
      if (error.name === "ValidationError") {
        return res.status(400).send("Invalid data: " + error.message);
      }
  
      
      res.status(500).send("An error occurred while creating the delivery boy. Please try again later.");
    }
  });
  
module.exports = router