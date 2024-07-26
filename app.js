const express = require('express')
const path = require('path')
const app = express()
const indexRouter = require('./routes/indexRoutes')
const userRouter = require('./routes/userRoutes')
const checkUser=require("./middlewares/checkUser")
const dbConnect = require('./configs/mongoose-connection')
const cookieParser = require('cookie-parser');
require("dotenv").config()
app.set('view engine', 'ejs')

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname,"public")));
app.use("/",indexRouter)
app.use("/user",userRouter)


app.listen(process.env.PORT)
