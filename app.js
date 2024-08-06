const express = require('express')
const path = require('path')
const app = express()
const indexRouter = require('./routes/indexRoutes')
const userRouter = require('./routes/userRoutes')
const adminRouter = require('./routes/adminRoutes')
const checkUser=require("./middlewares/checkUser")
const dbConnect = require('./configs/mongoose-connection')
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const expressSession = require('express-session')
require("dotenv").config()
app.set('view engine', 'ejs')
app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
 
}))
app.use(flash())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname,"public")));
app.use("/",indexRouter)
app.use("/user",userRouter)
app.use("/admin",adminRouter)


app.listen(process.env.PORT)
