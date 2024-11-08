const express = require('express')
const path = require('path')
const app = express()
require("dotenv").config()
const indexRouter = require('./routes/indexRoutes')
const userRouter = require('./routes/userRoutes')
const userModel=require("./models/user-model")
const adminRouter = require('./routes/adminRoutes')
const checkUser=require("./middlewares/checkUser")
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dbConnect = require('./configs/mongoose-connection')
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const expressSession = require('express-session')
app.set('view engine', 'ejs')
app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
 
}))
app.use(flash())
app.use(cookieParser())
app.use(express.json())
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname,"public")));
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('User Profile:', profile);
      let user = await userModel.findOne({ email: profile.emails[0].value });
      if (!user) {
        user = await userModel.create({
          name: profile.displayName, 
          email: profile.emails[0].value, 
        });
      }
      done(null, user); 
    } catch (err) {
      done(err, null);
    }
  }));
app.use("/",indexRouter)
app.use("/user",userRouter)
app.use("/admin",adminRouter)


app.listen(process.env.PORT)
