if(process.env.NODE_ENV!="production"){
   require('dotenv').config();
}
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express=require("express");
const app=express();
const port=8080;
const path=require("path");
const methodOverride=require("method-override");
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const ejsMate=require("ejs-mate");
const ExpressError = require("./utility/ExpressError.js");
const Review=require("./models/review.js");
const session=require("express-session");
const MongoStore=require("connect-mongo");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const DB_URL=process.env.MONGODB_URL;

console.log("SESSION SECRET:", process.env.SESSION_SECRET);

// for store the cookies in mongoDB Atlas
const store = MongoStore.create({
  mongoUrl: DB_URL,
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
  touchAfter: 24 * 3600,
});

const sessionOption = {
  store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};
console.log(DB_URL);

app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//used flash
app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  next();
});

//Define the routes
const listingsRoute=require("./routes/listings.js");
const reviewsRoute=require("./routes/review.js");
const userRoute=require("./routes/user.js");


app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.json());

app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.engine("ejs", ejsMate);

main().then(()=>{
  console.log("Database connected");
})
.catch((err)=>{
  console.log(err);
});
async function main(){
  await mongoose.connect(DB_URL);
}

// app.get("/",(req,res)=>{
//   res.send("You're in website home page");
// });


//Listing route
app.use("/",userRoute);

app.use("/listings",listingsRoute);

app.use("/listings/:id/reviews",reviewsRoute);

//If user go to any anoter route that is not exist
app.all("/*splat",(req,res,next)=>{
  next(new ExpressError(404,"Page not found"));
});

//middleware
// app.use((err,req,res,next)=>{

//   if(res.headersSent){
//     return next(err);
//   }

//   let {statusCode=500,message="Something went wrong!"}=err;

//   res.status(statusCode).render("listings/error",{message});
// });

app.use((err, req, res, next) => {
  console.error("ERROR:", err);
  console.error(err.stack);

  const { statusCode = 500, message = "Something went wrong!" } = err;

  res.status(statusCode).send(message);
});

app.listen(port,()=>{
  console.log("Server is running");
});
