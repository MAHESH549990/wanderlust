const express=require("express");
const router=express.Router();
const wrapAsync=require("../utility/wrapasync.js");
const Listing=require("../models/listing.js");
const {isLoggedIn,isOwner,validation}=require("../middleware.js");


const {storage}=require("../cloudConfig.js");
//for file data
const multer  = require('multer');
const upload = multer({storage});


//controllers
  
const listingController=require("../controllers/listings.js");

//router to group the same route path
router
   .route("/")
   .get(wrapAsync(listingController.index))
//   create the listing
   .post(
    upload.single('listing[image]'),
    isLoggedIn,
    validation,
    wrapAsync(listingController.createListing),
    );


//create listing
router.get("/new", isLoggedIn ,listingController.renderNewForm);
router.get("/:id/edit", isLoggedIn,wrapAsync(listingController.getEditRoute));
router
  .route("/:id")
  //show  route
   .get(wrapAsync(listingController.getShowROute))
   //Update route
   .put(isOwner, isLoggedIn,upload.single('listing[image]'),validation, wrapAsync(listingController.getUpdateRoute))
   //Delete route
   .delete(isOwner, isLoggedIn,wrapAsync(listingController.getDeleteRoute));

module.exports=router;