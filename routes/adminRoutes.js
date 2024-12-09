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
router.get("/dashboard",isAdmin,adminLogin,function(req, res){
    res.render("product-admin")
})

router.get("/addproduct",isloggedin,function(req, res){
    res.render("admin_addProduct")
})

router.post("/addproduct",upload.single("file"),async function(req, res){
    let {productname, description, price ,category,expiredate,instock} = req.body;
    console.log( {productname, description, price ,category,expiredate,instock,})
    console.log(req.file.buffer)
    // const newProduct = new productModel({
    //   name,
    //   description,
    //   price,
    //   image:{
    //     buffer:req.file.buffer,
    //     imageType:req.file.mimetype,
    //   }
    // }
    // )
    // await newProduct.save();
    res.send("Product added successfully")

})

module.exports = router