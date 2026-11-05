require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const dns = require("dns");
const dnsServers = (process.env.DNS_SERVERS || "8.8.8.8,8.8.4.4")
  .split(",")
  .map((server) => server.trim())
  .filter(Boolean);
dns.setServers(dnsServers);

const mongoose = require("mongoose");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const mongoUrl = process.env.MONGODB_URL;
const mapToken = process.env.MAP_TOKEN;

async function initialize() {
  if (!mongoUrl) {
    throw new Error("MONGODB_URL is missing from the project .env file.");
  }
  if (!mapToken) {
    throw new Error("MAP_TOKEN is missing; it is needed to add coordinates to the seed listings.");
  }

  await mongoose.connect(mongoUrl);
  console.log("Database connected.");

  const geocodingClient = mbxGeocoding({ accessToken: mapToken });
  const owner = process.env.SEED_OWNER_ID;
  const operations = [];

  for (const listing of initData.data) {
    const result = await geocodingClient
      .forwardGeocode({ query: [listing.location, listing.country].filter(Boolean).join(", "), limit: 1 })
      .send();
    const coordinates = result.body.features?.[0]?.geometry?.coordinates;
    if (!coordinates) {
      throw new Error("Could not find map coordinates for " + listing.location + ", " + listing.country + ".");
    }

    const seed = {
      ...listing,
      geometry: { type: "Point", coordinates },
      ...(owner ? { owner } : {}),
    };
    operations.push({
      updateOne: {
        filter: { title: listing.title, location: listing.location, country: listing.country },
        update: { $setOnInsert: seed },
        upsert: true,
      },
    });
  }

  if (operations.length) {
    const result = await Listing.bulkWrite(operations);
    console.log("Initialization complete. Added " + result.upsertedCount + " new listings; existing seed listings were kept.");
  } else {
    console.log("No seed listings found.");
  }
}

initialize()
  .catch((error) => {
    console.error("Initialization failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
