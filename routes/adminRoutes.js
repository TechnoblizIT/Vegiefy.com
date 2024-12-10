const express = require('express');
const router=express.Router();
const {registerAdmin,loginAdmin}=require("../controllers/adminAuthController");
const { render } = require('ejs');
const upload =require("../configs/multer-setup")
const productModel=require("../models/product-model");
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

module.exports = router