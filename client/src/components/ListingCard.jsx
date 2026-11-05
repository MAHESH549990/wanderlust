import React, { useState } from "react";
import { Link } from "react-router-dom";
import { imageFor, money } from "../api.js";

export default function ListingCard({ listing, includeTax }) {
  const [saved, setSaved] = useState(false);
  const total = Math.round(Number(listing.price || 0) * 1.18);

  return (
    <Link to={"/listings/" + listing._id} className="listing-link">
      <article className="card listing-card">
        <div className="listing-image-wrap">
          <img src={imageFor(listing)} className="card-img-top" alt={listing.title} loading="lazy" />
          <span className="listing-category">{listing.displayCategory}</span>
          <button className={"save-listing " + (saved ? "saved" : "")} type="button" aria-label={saved ? "Remove from saved stays" : "Save stay"} onClick={(event) => { event.preventDefault(); setSaved(!saved); }}>
            <i className={saved ? "fa-solid fa-heart" : "fa-regular fa-heart"} />
          </button>
        </div>
        <div className="card-body">
          <div className="listing-card-title">
            <h2>{listing.title}</h2>
            {listing.reviewCount > 0 && <span className="listing-rating"><i className="fa-solid fa-star" /> {listing.averageRating.toFixed(1)} <span className="rating-count">({listing.reviewCount})</span></span>}
          </div>
          <p className="listing-location">{[listing.location, listing.country].filter(Boolean).join(", ")}</p>
          <p className="listing-price"><strong>{money(includeTax ? total : listing.price)}</strong> <span>/ night{includeTax ? " · incl. tax" : ""}</span></p>
        </div>
      </article>
    </Link>
  );
}
