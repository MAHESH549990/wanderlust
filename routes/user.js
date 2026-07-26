const express=require("express");
const router = express.Router();
const User=require("../models/user");
const flash = require("connect-flash/lib/flash");
const wrapasync = require("../utility/wrapasync");
const passport=require("passport");
const {saveRedirectUrl}=require("../middleware.js");

const userController=require("../controllers/user.js");

router.get("/logout",userController.getLogoutUser);
router
   .route("/signup")
   .get(userController.getSignupPage)
   .post(wrapasync(userController.getRegisteredUser))

router
   .route("/login")
   .get(userController.getLoginpage)
   .post(
      saveRedirectUrl,
      passport.authenticate("local",
      {failureRedirect:"/login",failureFlash:true,}
      ),
      userController.getLoginUserDetails
   );

router.get("/profile",userController.getUserProfile);
module.exports=router;