const express=require("express");
const router=express.Router();

//user
router.get("/",(req,res)=>{
  res.send("You're in the User home page");
});

router.get("/:id",(req,res)=>{
  res.send("You're in the User ID page");
});

router.delete("/:id",(req,res)=>{
  res.send("You're in delete route");
});

router.post("/",(req,res)=>{
 res.send("You're in the post route");
});

module.exports=router;