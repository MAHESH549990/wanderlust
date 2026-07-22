const express=require("express");
const app=express();
const user=require("./routes/user");
const posts=require("./routes/posts");
const cookieParser=require("cookie-parser");
const session=require("express-session");
const flash=require("connect-flash");
const path=require("path");

const sessionOption={
  secret:"mysupersecretstring",
  resave:false,
  saveUninitialized:true,
}

app.use(session(sessionOption));
app.use(flash());

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use((req,res,next)=>{
 res.locals.successMsg=req.flash("success");
  res.locals.errorMsg=req.flash("error");
  next();
})

app.get("/username",(req,res)=>{
  let {name="Unknown"}=req.query;
  if(name==="Unknown"){
      req.flash("error","User not Registered");
  }
  else{
      req.flash("success","User Registerd Successfully");
  }
  req.session.name=name;
  res.redirect("/hello");
});

app.get("/hello",(req,res)=>{
  res.render("username.ejs",{name:req.session.name});
});




// app.get("/countroute",(req,res)=>{
//   if(req.session.count){
//     req.session.count++;
//   }
//   else{
//     req.session.count=1;
//   }
//   res.send(`User come this website ${req.session.count} times`);
// });

app.get("/test",(req,res)=>{
  res.send("Text Succesful!");
});

// //user
// app.use("/user",user);

// //posts
// app.use("/posts",posts);

// app.get("/getsignedcookie",(req,res)=>{
//   res.cookie("gmail","mohanbhat805777",{signed:true});
//   res.send("Cookie signed");
// });

// app.get("/verify",(req,res)=>{
//   console.log(req.signedCookies);
//   res.send("Verified");
// })

// //cookies
// app.get("/getcookies",(req,res)=>{
//   res.cookie("greet","Welcome");
//   res.send("This is cookie");
// });

// app.get("/greet",(req,res)=>{
//   let {name="Priyanshu"}=req.cookies;
//   res.send(`Hi ${name} Welcome to the website`);
// });

// app.get("/",(req,res)=>{
//   res.send("You're in the root page");
//   console.dir(req.cookies);
// });

app.listen("3000",()=>{
  console.log("Server is running");
});

//posts

