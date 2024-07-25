const express = require('express')
const path = require('path')
const app = express()
const indexRouter = require('./routes/indexRoutes')
const dbConnect = require('./configs/mongoose-connection')
require("dotenv").config()
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname,"public")));
app.use("/",indexRouter)


app.listen(process.env.PORT)
