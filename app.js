const express=require("express");
const app=express();
const port=8080;
const path=require("path");
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended:true}));

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



//index route
app.get("/listing",async(req,res)=>{
   const alllisting=await Listing.find({});
   res.render("listings/index",{alllisting});
});

//show  route
app.get("/listing/:id",async (req,res)=>{
  const {id}=req.params;
  const listing= await Listing.findById(id);
  res.render("listings/show",{listing});
})

//create listing
app.get("/listing/new", (req,res)=>{
 res.send("hii");
});