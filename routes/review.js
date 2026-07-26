const express=require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync=require("../utility/wrapasync.js");
const Review=require("../models/review.js");
const Listing=require("../models/listing.js");
const {reviewvalidation,isLoggedIn,authorReview}=require("../middleware.js");

const reviewController=require("../controllers/reviews.js");

//joi function for validation


//Review Route for listing
router.post("/",isLoggedIn,reviewvalidation,wrapAsync(reviewController.reviewRouteListing));

// Delete Reviews
router.delete("/:reviewId",authorReview,isLoggedIn,wrapAsync(reviewController.reviewRouteDelete));


module.exports=router;