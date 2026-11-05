if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const dns = require("dns");
dns.setServers((process.env.DNS_SERVERS || "8.8.8.8,8.8.4.4").split(",").map((server) => server.trim()).filter(Boolean));

const path = require("path");
const { execSync } = require("child_process");
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const apiRoutes = require("./routes/api");

const app = express();
const port = process.env.PORT || 8080;
const dbUrl = process.env.MONGODB_URL;
app.set("trust proxy", 1);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  store: MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use("/api", apiRoutes);
app.use(express.static(path.join(__dirname, "public", "app")));
app.use(express.static(path.join(__dirname, "public")));

app.get(/^\/api\/.*/, (req, res) => res.status(404).json({ message: "API route not found." }));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "app", "index.html"), (error) => {
    if (error && !res.headersSent) {
      res.status(503).send("React app has not been built yet. Run npm run build.");
    }
  });
});

app.use((error, req, res, next) => {
  const status = error.statusCode || error.status || 500;
  if (req.path.startsWith("/api/")) {
    return res.status(status).json({
      message: status >= 500 ? "The server couldn't complete that request." : error.message,
    });
  }
  if (res.headersSent) return next(error);
  return res.status(status).send("The server couldn't complete that request.");
});

async function startServer() {
  if (!dbUrl) throw new Error("MONGODB_URL is missing from the project .env file.");
  if (!process.env.SESSION_SECRET) throw new Error("SESSION_SECRET is missing from the project .env file.");
  console.log("Building React client...");
  execSync("npm run build", { cwd: __dirname, stdio: "inherit" });
  await mongoose.connect(dbUrl);
  app.listen(port, () => console.log("Wanderlust is ready on port " + port + "."));
}

startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});
