const express=require("express");
const app=express();
const port=8080;
const path=require("path");
const methodOverride=require("method-override")
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
const ejsMate=require("ejs-mate");


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use("ejs",ejsMate);

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
app.get("/listings",async(req,res)=>{
   const alllisting=await Listing.find({});
   res.render("listings/index",{alllisting});
});

//create listing
app.get("/listings/new", (req,res)=>{
 res.render("listings/new");
});

//show  route
app.get("/listings/:id", async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  res.render("listings/show", { listing });
});

app.post("/listings",async(req,res)=>{
 const newListing=new Listing(req.body.listing);
 await newListing.save();
 res.redirect("/listings");
});

// Edit route

app.get("/listings/:id/edit",async(req,res)=>{
  const {id}=req.params;
  const listing= await Listing.findById(id);
  res.render("listings/edit",{listing});
});

//Update route

app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`); 
});

//Delete route
app.delete("/listings/:id",async(req,res)=>{
  let {id}=req.params;
  await Listing.findByIdAndDelete(id,{new:true});
  res.redirect("/listings");
});