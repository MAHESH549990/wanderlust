# Wanderlust

Wanderlust is a full-stack travel accommodation platform for discovering and sharing memorable places to stay. Guests can search and filter listings, view property locations on an interactive map, and leave reviews. Hosts can create listings, upload photos, and manage their own properties.

The project combines a React user interface with an Express API and MongoDB database. It includes session-based authentication, listing ownership checks, Cloudinary image uploads, and Mapbox geocoding.

**Live app:** [wanderlust-llru.onrender.com](https://wanderlust-llru.onrender.com)  
**GitHub repository:** [github.com/MAHESH549990/wanderlust](https://github.com/MAHESH549990/wanderlust)

## Features

- Browse and search stays by title, location, and country
- Filter listings by category
- Create, edit, and delete your own listings
- Upload listing photos to Cloudinary
- View listing locations on a Mapbox map
- Create an account, log in, and maintain a session
- Add reviews and delete your own reviews
- Responsive pages for listings, details, login, signup, and profile

## Tech stack

- **Frontend:** React, React Router, Vite, Bootstrap, custom CSS
- **Backend:** Node.js, Express, REST-style JSON API
- **Database:** MongoDB Atlas, Mongoose
- **Authentication:** Passport, Passport Local Mongoose, Express sessions, MongoDB session store
- **Images:** Multer, Cloudinary
- **Maps and geocoding:** Mapbox
- **Validation:** Joi

## Project structure

```text
client/
  index.html
  src/
    App.jsx                 App routes and layout
    components/             Navbar, footer, listing card, map, shared states
    context/                Shared user session and app notifications
    data/                   Listing category labels and icons
    pages/                  Listing, detail, form, auth, and profile pages
    api.js                  Frontend API helper
    react.css               React-specific layout styles
  vite.config.mjs           Vite build and development proxy settings

models/                     User, listing, and review schemas
routes/api.js               Authentication, listing, review, and profile API
init/                       Idempotent sample listing initializer
public/css/style.css        Shared visual styles
app.js                      Express server, sessions, Passport, and static hosting
cloudConfig.js              Cloudinary upload configuration
schema.js                   Request validation rules
```

## Run locally

### Requirements

- Node.js 22.12 or newer
- A MongoDB database (Atlas or another reachable MongoDB server)
- Cloudinary credentials
- A Mapbox access token

### Configure environment

Create a `.env` file in the project root. Add your own values for:

```env
MONGODB_URL=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
MAP_TOKEN=your_mapbox_token
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
```

Keep `.env` private and never commit real credentials.

### Production-style local run

From the project root:

```powershell
npm install
npm start
```

`npm start` builds the React client and starts the Express server. Open [http://localhost:8080](http://localhost:8080).

### Frontend development

Open two terminals in the project root. Start the API server in the first terminal:

```powershell
node app.js
```

Start Vite in the second terminal:

```powershell
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Vite proxies API requests to Express on port 8080.

### Sample listings

To add the sample listings, run this from the project root:

```powershell
node init/index.js
```

The initializer uses `MONGODB_URL` and `MAP_TOKEN` from `.env`. It keeps existing listings and inserts missing sample listings.

## What I learned

- Building a React frontend from reusable page and UI components
- Connecting a React app to an Express JSON API
- Managing authentication with Passport and server-side sessions
- Modeling users, listings, and reviews with MongoDB and Mongoose
- Protecting listing and review actions with ownership checks
- Handling image uploads with Multer and Cloudinary
- Geocoding addresses and displaying map locations with Mapbox
- Validating listing and review data before saving it

## About the author

**Mahesh Bhatt** is a BCA student in Artificial Intelligence and Data Science and a full-stack developer.

- **GitHub:** [MAHESH549990](https://github.com/MAHESH549990)
- **Project:** [Wanderlust repository](https://github.com/MAHESH549990/wanderlust)
- **Live app:** [wanderlust-llru.onrender.com](https://wanderlust-llru.onrender.com)
