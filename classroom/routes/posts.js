const express=require("express");
const router=express.Router();


router.get("/",(req,res)=>{
  res.send("You're in the Posts home page");
});

router.get("/:id",(req,res)=>{
  res.send("You're in the Posts ID page");
});

router.delete("/:id",(req,res)=>{
  res.send("You're in posts delete route");
});

router.post("/",(req,res)=>{
  res.send("You're in the post posts route");
});


module.exports=router;

