const express = require("express");
const passport = require("passport");
const multer = require("multer");
const mongoose = require("mongoose");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const Listing = require("../models/listing");
const Review = require("../models/review");
const User = require("../models/user");
const { storage } = require("../cloudConfig");
const { listingSchem, reviewSchema } = require("../schema");

const router = express.Router();
const upload = multer({ storage });
const geocoder = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });
const categories = [
  ["Castles", /castle|fort|palace|chateau|villa|estate|manor/i],
  ["Mountains", /mountain|alpine|hill|cabin|peak/i],
  ["Iconic Cities", /city|downtown|urban|skyline|metropolitan/i],
  ["Amazing Pools", /pool|swim|waterfront|resort/i],
  ["Camping", /camp|tent|glamp|outdoor/i],
  ["Village", /village|rural|countryside|farmhouse/i],
  ["Farms", /farm|vineyard|orchard|ranch/i],
  ["Rooms", /room|loft|apartment|studio|suite/i],
];

function categoryFor(listing) {
  if (listing.category) return listing.category;
  const text = [listing.title, listing.description, listing.location, listing.country].join(" ");
  return categories.find(([, pattern]) => pattern.test(text))?.[0] || "Trending";
}

function sendError(res, status, message) {
  return res.status(status).json({ message });
}

function requireUser(req, res, next) {
  if (!req.isAuthenticated()) return sendError(res, 401, "Please log in to continue.");
  next();
}

async function ownedListing(req, res, next) {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return sendError(res, 404, "Listing not found.");
    if (!listing.owner || !listing.owner.equals(req.user._id)) {
      return sendError(res, 403, "You do not have permission to change this listing.");
    }
    req.listing = listing;
    next();
  } catch (error) {
    next(error);
  }
}

router.get("/bootstrap", (req, res) => {
  res.json({
    user: req.user ? { id: req.user._id, username: req.user.username, email: req.user.email } : null,
    success: [],
    error: [],
    mapToken: process.env.MAP_TOKEN || "",
  });
});

router.get("/listings", async (req, res, next) => {
  try {
    const search = String(req.query.search || "").trim();
    const filter = {};
    if (search) {
      const escaped = search.replace(/[.*+?^$()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: escaped, $options: "i" } },
        { location: { $regex: escaped, $options: "i" } },
        { country: { $regex: escaped, $options: "i" } },
      ];
    }
    const listings = await Listing.find(filter).sort({ _id: -1 }).lean();
    const reviewIds = listings.flatMap((listing) => listing.reviews || []);
    const reviews = reviewIds.length
      ? await Review.find({ _id: { $in: reviewIds } }).select("rating").lean()
      : [];
    const ratingsById = new Map(reviews.map((review) => [String(review._id), review.rating]));
    res.json({
      listings: listings.map((listing) => {
        const ratings = (listing.reviews || [])
          .map((reviewId) => ratingsById.get(String(reviewId)))
          .filter((rating) => Number.isFinite(rating));
        return {
          ...listing,
          displayCategory: categoryFor(listing),
          reviewCount: ratings.length,
          averageRating: ratings.length ? ratings.reduce((total, rating) => total + rating, 0) / ratings.length : null,
        };
      }),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/listings/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return sendError(res, 404, "Listing not found.");
    const listing = await Listing.findById(req.params.id)
      .populate({ path: "reviews", populate: { path: "author", select: "username" } })
      .populate("owner", "username")
      .lean();
    if (!listing) return sendError(res, 404, "Listing not found.");
    listing.displayCategory = categoryFor(listing);
    res.json({ listing });
  } catch (error) {
    next(error);
  }
});

router.post("/listings", requireUser, upload.single("image"), async (req, res, next) => {
  try {
    const listingData = {
      title: req.body.title,
      description: req.body.description,
      country: req.body.country,
      location: req.body.location,
      price: req.body.price,
      category: req.body.category || "",
    };
    const { error } = listingSchem.validate({ listing: listingData });
    if (error) return sendError(res, 400, error.details.map((detail) => detail.message).join(", "));
    if (!req.file) return sendError(res, 400, "Please choose an image for your listing.");

    const result = await geocoder.forwardGeocode({
      query: [listingData.location, listingData.country].filter(Boolean).join(", "),
      limit: 1,
    }).send();
    const coordinates = result.body.features?.[0]?.geometry?.coordinates;
    if (!coordinates) return sendError(res, 400, "We couldn't find that location. Check the location and country.");

    const listing = await Listing.create({
      ...listingData,
      owner: req.user._id,
      image: { url: req.file.path, filename: req.file.filename },
      geometry: { type: "Point", coordinates },
    });
    res.status(201).json({ listing, message: "Listing created." });
  } catch (error) {
    next(error);
  }
});

router.put("/listings/:id", requireUser, ownedListing, upload.single("image"), async (req, res, next) => {
  try {
    const listingData = {
      title: req.body.title,
      description: req.body.description,
      country: req.body.country,
      location: req.body.location,
      price: req.body.price,
      category: req.body.category || "",
    };
    const { error } = listingSchem.validate({ listing: listingData });
    if (error) return sendError(res, 400, error.details.map((detail) => detail.message).join(", "));

    const addressChanged = listingData.location !== req.listing.location || listingData.country !== req.listing.country;
    req.listing.set(listingData);
    if (req.file) req.listing.image = { url: req.file.path, filename: req.file.filename };
    if (addressChanged) {
      const result = await geocoder.forwardGeocode({
        query: [listingData.location, listingData.country].filter(Boolean).join(", "),
        limit: 1,
      }).send();
      const coordinates = result.body.features?.[0]?.geometry?.coordinates;
      if (!coordinates) return sendError(res, 400, "We couldn't find that location. Check the location and country.");
      req.listing.geometry = { type: "Point", coordinates };
    }
    await req.listing.save();
    res.json({ listing: req.listing, message: "Listing updated." });
  } catch (error) {
    next(error);
  }
});

router.delete("/listings/:id", requireUser, ownedListing, async (req, res, next) => {
  try {
    await Listing.findByIdAndDelete(req.listing._id);
    res.json({ message: "Listing deleted." });
  } catch (error) {
    next(error);
  }
});

router.post("/listings/:id/reviews", requireUser, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return sendError(res, 404, "Listing not found.");
    const { error } = reviewSchema.validate({ review: req.body });
    if (error) return sendError(res, 400, error.details.map((detail) => detail.message).join(", "));
    const listing = await Listing.findById(req.params.id);
    if (!listing) return sendError(res, 404, "Listing not found.");
    const review = await Review.create({ ...req.body, listing: listing._id, author: req.user._id });
    listing.reviews.push(review._id);
    await listing.save();
    const populatedReview = await Review.findById(review._id).populate("author", "username").lean();
    res.status(201).json({ review: populatedReview, message: "Review added." });
  } catch (error) {
    next(error);
  }
});

router.delete("/listings/:id/reviews/:reviewId", requireUser, async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    const review = await Review.findById(req.params.reviewId);
    if (!listing || !review || !listing.reviews.some((id) => id.equals(review._id))) return sendError(res, 404, "Review not found.");
    if (!review.author.equals(req.user._id)) return sendError(res, 403, "You can only delete your own reviews.");
    await Listing.findByIdAndUpdate(req.params.id, { $pull: { reviews: review._id } });
    await Review.findByIdAndDelete(review._id);
    res.json({ message: "Review deleted." });
  } catch (error) {
    next(error);
  }
});

router.post("/auth/signup", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return sendError(res, 400, "Username, email, and password are required.");
    const user = await User.register(new User({ username, email }), password);
    req.login(user, (error) => {
      if (error) return next(error);
      res.status(201).json({ user: { id: user._id, username: user.username, email: user.email }, message: "Welcome to Wanderlust." });
    });
  } catch (error) {
    if (error.name === "UserExistsError" || error.name === "ValidationError") {
      return sendError(res, 400, error.message);
    }
    next(error);
  }
});

router.post("/auth/login", (req, res, next) => {
  passport.authenticate("local", (error, user, info) => {
    if (error) return next(error);
    if (!user) return sendError(res, 401, info?.message || "Invalid username or password.");
    req.login(user, (loginError) => {
      if (loginError) return next(loginError);
      const redirectTo = req.session.redirectUrl || "/listings";
      delete req.session.redirectUrl;
      res.json({
        user: { id: user._id, username: user.username, email: user.email },
        redirectTo,
        message: "Welcome back.",
      });
    });
  })(req, res, next);
});

router.post("/auth/logout", requireUser, (req, res, next) => {
  req.logout((error) => {
    if (error) return next(error);
    req.session.destroy((destroyError) => {
      if (destroyError) return next(destroyError);
      res.clearCookie("connect.sid");
      res.json({ message: "You have logged out." });
    });
  });
});

router.get("/profile", requireUser, (req, res) => {
  res.json({ user: { id: req.user._id, username: req.user.username, email: req.user.email } });
});

module.exports = router;
