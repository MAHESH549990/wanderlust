const mongoose=require("mongoose");
const {Schema}=mongoose;

const reviewSchema=Schema({
  listing:{
    type:Schema.Types.ObjectId,
    ref:"Listing",
    required:true,
  },
  comment:String,
  rating:{
    type:Number,
    min:1,
    max:5
  },
  currentD:{
    type:Date,
    default:Date.now,
  },
  author:{
    type:Schema.Types.ObjectId,
    ref:"User",
  }
});

module.exports=mongoose.model("Review",reviewSchema);
