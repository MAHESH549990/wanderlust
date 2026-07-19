const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review=require("./review");

  
const defaultImage ="https://images.unsplash.com/photo-1783341257870-b87a4432304d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";


const listingSchema=new Schema({
  title:{
    type:String,
    required:true,
  },
  description:String,
  image: {
    filename: String,
    url: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1783341257870-b87a4432304d?q=80&w=687"
    }
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
});

//If we delete the listing every review of the listing also deleted

listingSchema.post("findOneAndDelete",async(listing)=>{
  if(listing){
    await Review.deleteMany({_id:{$in:listing.reviews}});
  }
});

const Listing=mongoose.model("Listing",listingSchema);

module.exports=Listing;