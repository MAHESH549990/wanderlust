const express=require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync=require("../utility/wrapasync.js");
const ExpressError = require("../utility/ExpressError.js");
const {listingSchem,reviewSchema}=require("../schema.js");
const Review=require("../models/review.js");
const Listing=require("../models/listing.js");

//joi function for validation

const reviewvalidation=((req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
      let errMsg=error.details.map((el)=>el.message).join(",");
      throw new ExpressError(400,errMsg);
    }
    else{
      next();
    }
});


//Review Route for listing
router.post("/",reviewvalidation,wrapAsync(async(req,res)=>{
   let listing=await Listing.findById(req.params.id);
   let newRew=new Review(req.body.review);

   listing.reviews.push(newRew);

   await newRew.save();
   await listing.save();
   req.flash("success","New Review Added");
   res.redirect(`/listings/${listing._id}`);
}));

// Delete Reviews
router.delete("/:reviewId",wrapAsync(async(req,res)=>{
  let {id,reviewId}=req.params;
  await Listing.findByIdAndUpdate(id, {$pull: {reviews:reviewId}});
  await Review.findByIdAndDelete(reviewId);
  req.flash("success","Review Deleted");
  res.redirect(`/listings/${id}`);
}));


module.exports=router;