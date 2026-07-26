const Listing=require("./models/listing");
const Review=require("./models/review.js");
const ExpressError = require("./utility/ExpressError.js");
const {listingSchem,reviewSchema}=require("./schema.js");


module.exports.isLoggedIn=(req,res,next)=>{
  if(!req.isAuthenticated()){
  //move to the user currect url
  req.session.redirectUrl=req.originalUrl;
  req.flash("error","You must be logged in create listing");
  return res.redirect("/login")
 }
 next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl=req.session.redirectUrl;
  }
  next();
}

//owner of the listing
module.exports.isOwner=async(req,res,next)=>{
    let { id } = req.params;
    let listing=await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
       req.flash("error","You are not the owner of the listing");
       return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validation=((req,res,next)=>{
    let {error}=listingSchem.validate(req.body);
    if(error){
      let errMsg=error.details.map((el)=>el.message).join(",");
      throw new ExpressError(400,errMsg);
    }
    else{
      next();
    }
});


module.exports.reviewvalidation=((req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
      let errMsg=error.details.map((el)=>el.message).join(",");
      throw new ExpressError(400,errMsg);
    }
    else{
      next();
    }
});


module.exports.authorReview=async(req,res,next)=>{
    let { reviewId,id } = req.params;
    let review=await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
       req.flash("error","You are not the owner of the review");
       return res.redirect(`/listings/${id}`);
    }
    next();
}