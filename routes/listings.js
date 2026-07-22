const express=require("express");
const router=express.Router();
const wrapAsync=require("../utility/wrapasync.js");
const ExpressError = require("../utility/ExpressError.js");
const {listingSchem,reviewSchema}=require("../schema.js");
const Listing=require("../models/listing.js");


const validation=((req,res,next)=>{
    let {error}=listingSchem.validate(req.body);
    if(error){
      let errMsg=error.details.map((el)=>el.message).join(",");
      throw new ExpressError(400,errMsg);
    }
    else{
      next();
    }
});

router.get("/",wrapAsync(async(req,res,next)=>{
    const alllisting=await Listing.find({});
   res.render("listings/index",{alllisting});
}));

//create listing
router.get("/new", (req,res)=>{
 res.render("listings/new");
});

//show  route
router.get("/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  if(!listing){
      req.flash("error", "Listing does not exist");
      return res.redirect("/listings");
  }
  res.render("listings/show", { listing });
}));

router.post("/",
    validation,
    wrapAsync(async (req, res) => {   
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success","New Listing Added");
    res.redirect("/listings");
}));

// Edit route

router.get("/:id/edit",wrapAsync(async(req,res)=>{
  const {id}=req.params;
  const listing= await Listing.findById(id);
  if(!listing){
      req.flash("error", "Listing does not exist");
      return res.redirect("/listings");
  }
  res.render("listings/edit",{listing});
}));

//Update route

router.put("/:id",validation, wrapAsync(async (req, res) => {
  
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  req.flash("success","Listing Updated");
  res.redirect(`/listings/${id}`); 
}));

//Delete route
router.delete("/:id",wrapAsync(async(req,res)=>{
  let {id}=req.params;
  await Listing.findByIdAndDelete(id,{new:true});
  req.flash("success","Listing Deleted");
  res.redirect("/listings");
}));


module.exports=router;