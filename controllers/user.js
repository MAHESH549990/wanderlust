const User=require("../models/user");

module.exports.getSignupPage=(req,res)=>{
  console.log("LOGIN PAGE RENDER");
  res.render("user/signup.ejs");
}


module.exports.getRegisteredUser=async(req,res,next)=>{
  try {
    let { username, email, password } = req.body;

    const newUser = new User({
      email,
      username
    });

    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }

      req.flash("success", "Welcome to Wanderlust");
      return res.redirect("/listings");
    });

  } catch (err) {
    req.flash("error", err.message);
    return res.redirect("/signup");
  }
};

module.exports.getLoginpage=(req,res)=>{
  res.render("user/login.ejs");
}

module.exports.getLoginUserDetails=async(req,res)=>{
    req.flash("success","Welcome Back! to wanderlust");
    let redirectUrl=res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
}
module.exports.getLogoutUser=(req,res,next)=>{
  req.logout((err)=>{
    if(err){
      return next(err);
    }
    req.flash("success","you are logged out");
    res.redirect("/listings");
  });
}

module.exports.getUserProfile=async(req,res)=>{
    const user = await User.findById(req.user._id);
    res.render("listings/profile", { user });
}