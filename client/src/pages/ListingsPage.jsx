import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import ListingCard from "../components/ListingCard.jsx";
import { ErrorPanel, Loading } from "../components/PageStates.jsx";
import { categoryIcons, categoryOptions } from "../data/listingCategories.js";

export default function ListingsPage() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const [listings, setListings] = useState([]);
  const [category, setCategory] = useState("");
  const [includeTax, setIncludeTax] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api("/api/listings" + (search ? "?search=" + encodeURIComponent(search) : ""))
      .then((data) => { setListings(data.listings); setError(""); })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [search]);

  const filtered = category ? listings.filter((listing) => listing.displayCategory === category) : listings;
  return (
    <section className="listing-page">
      <div className="listing-heading">
        <div>
          <p className="eyebrow">FIND A PLACE TO RESET</p>
          <h1>{search ? "Stays matching “" + search + "”" : "Find your next stay"}</h1>
          <p className="page-subtitle">Thoughtful places for your next getaway.</p>
        </div>
        <Link className="btn btn-primary host-cta" to="/listings/new"><i className="fa-solid fa-plus" /> List your place</Link>
      </div>
      <div className="react-filters" aria-label="Filter listings by category">
        {categoryOptions.map((item) => (
          <button key={item} className={"filter " + (category === item ? "is-active" : "")} type="button" aria-pressed={category === item} onClick={() => setCategory(category === item ? "" : item)}>
            <i className={"fa-solid " + categoryIcons[item]} aria-hidden="true" />
            <span>{item}</span>
          </button>
        ))}
        <label className="tax-toggle">
          <span>Show price with tax</span>
          <input className="form-check-input" type="checkbox" checked={includeTax} onChange={(event) => setIncludeTax(event.target.checked)} />
        </label>
      </div>
      {loading ? <Loading /> : error ? <ErrorPanel message={error} /> : (
        <>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4 listing-grid">
            {filtered.map((listing) => <div className="col" key={listing._id}><ListingCard listing={listing} includeTax={includeTax} /></div>)}
          </div>
          {!filtered.length && <p className="empty-listings">{category ? "No stays in this category yet. Try another filter." : "No stays found. Try a different search."}</p>}
        </>
      )}
    </section>
  );
}
