const mongoose=require("mongoose");
const {Schema}=mongoose;

const reviewSchema=Schema({
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
});

module.exports=mongoose.model("Review",reviewSchema);