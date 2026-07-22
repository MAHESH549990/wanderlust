const express=require("express");
const app=express();
const port=8080;
const path=require("path");
const methodOverride=require("method-override");
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
const ejsMate=require("ejs-mate");
const ExpressError = require("./utility/ExpressError.js");
const Review=require("./models/review.js");
const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const sessionOption={
  secret:"mysupersecretstring",
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now()+7*24*60*60*1000, //for 7 days 
    maxAge:7*24*60*60*1000,
    httpOnly:true,//security purpose
  },
};

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
  await mongoose.connect(MONGO_URL);
}

app.listen(port,()=>{
  console.log("Server is running");
});

app.get("/",(req,res)=>{
  res.send("You're in website home page");
});


//Listing route
app.use("/listings",listingsRoute);
app.use("/listings/:id/reviews",reviewsRoute);
app.use("/",userRoute);

//If user go to any anoter route that is not exist
app.all("/*splat",(req,res,next)=>{
  next(new ExpressError(404,"Page not found"));
});

//middleware
app.use((err,req,res,next)=>{
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("listings/error", { message });
});

