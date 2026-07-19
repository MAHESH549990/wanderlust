//use for validation check schema in backend

const joi=require("joi");
module.exports.listingSchem=joi.object({
  listing:joi.object({
    title:joi.string().required(),
    description:joi.string().required(),
    country:joi.string().required(),
    location:joi.string().required(),
    price:joi.number().required().min(1),
    image:joi.string().allow("",null),
  }).required(),
});

//review schema
module.exports.reviewSchema=joi.object({
  review:joi.object({
    comment:joi.string().required(),
    rating:joi.number().required().min(1).max(5),
  }).required(),
});