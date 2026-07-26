const Listing=require("../models/listing.js");
//for map
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });



module.exports.index =async(req,res,next)=>{
    const alllisting=await Listing.find({});
   res.render("listings/index.ejs",{alllisting});
};

module.exports.renderNewForm=(req,res)=>{
 res.render("listings/new");
}

module.exports.getShowROute = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing does not exist");
    return res.redirect("/listings");
  }

  console.log("Geometry:", listing.geometry);
  console.log("Coordinates:", listing.geometry.coordinates);
  console.log("Is Array:", Array.isArray(listing.geometry.coordinates));

  res.render("listings/show", {
    listing,
    mapToken: process.env.MAP_TOKEN,
  });
};


module.exports.createListing = async (req, res) => {
    let responce=await geocodingClient.forwardGeocode({
      query: req.body.listing.location,
      limit: 1
      })
      .send()

    let url=req.file.path;
    let filename=req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image={url,filename};
    newListing.geometry=responce.body.features[0].geometry;
    let saveListing= await newListing.save();
    console.log(saveListing);
    req.flash("success", "New Listing Added");
    res.redirect("/listings");
};

module.exports.getEditRoute=async(req,res)=>{
  const {id}=req.params;
  const listing= await Listing.findById(id);
  if(!listing){
      req.flash("error", "Listing does not exist");
      return res.redirect("/listings");
  }
  res.render("listings/edit",{listing});
}

module.exports.getUpdateRoute=async (req, res) => {
  let { id } = req.params;
  let listing= await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if(typeof req.file !== "undefined"){
  let url=req.file.path;
  let filename=req.file.filename;
  listing.image={url,filename};
  await listing.save()
  }

  req.flash("success","Listing Updated");
  res.redirect(`/listings/${id}`); 
}

module.exports.getDeleteRoute=async(req,res)=>{
  let {id}=req.params;
  await Listing.findByIdAndDelete(id,{new:true});
  req.flash("success","Listing Deleted");
  res.redirect("/listings");
}

