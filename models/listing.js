const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review=require("./review");
const { required } = require("joi");

  
const defaultImage ="https://images.unsplash.com/photo-1783341257870-b87a4432304d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";


const listingSchema=new Schema({
  title:{
    type:String,
    required:true,
  },
  description:String,
  image: {
    url:String,
    filename:String,
  },
  price:Number,
  location:String,
  country:String,
  reviews:[
    {
      type:Schema.Types.ObjectId,
      ref:"Review",
    },
  ],
  owner:{
    type:Schema.Types.ObjectId,
    ref:"User",
  },
  geometry:{
    type:{
      type:String,
      enum:["Point"],
      required:true,
    },
    coordinates:{
      type:[Number],
      required:true,
    },
  }
});

//If we delete the listing every review of the listing also deleted

listingSchema.post("findOneAndDelete",async(listing)=>{
  if(listing){
    await Review.deleteMany({_id:{$in:listing.reviews}});
  }
});

const Listing=mongoose.model("Listing",listingSchema);

module.exports=Listing;