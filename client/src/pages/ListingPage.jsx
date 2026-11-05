import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, imageFor, money } from "../api.js";
import MapView from "../components/MapView.jsx";
import { ErrorPanel, Loading } from "../components/PageStates.jsx";
import { useApp } from "../context/AppContext.jsx";

export default function ListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, mapToken, notify } = useApp();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [busy, setBusy] = useState(false);

  async function loadListing() {
    setLoading(true);
    try {
      const data = await api("/api/listings/" + id);
      setListing(data.listing);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadListing(); }, [id]);
  const ownsListing = user && listing && String(listing.owner?._id || listing.owner) === String(user.id);

  async function deleteListing() {
    if (!window.confirm("Delete this listing?")) return;
    try {
      const data = await api("/api/listings/" + id, { method: "DELETE" });
      notify(data.message);
      navigate("/listings");
    } catch (requestError) {
      notify(requestError.message, "error");
    }
  }

  async function submitReview(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const data = await api("/api/listings/" + id + "/reviews", {
        method: "POST",
        body: { comment, rating: Number(rating) },
      });
      setListing((current) => ({ ...current, reviews: [...(current.reviews || []), data.review] }));
      setComment("");
      notify(data.message);
    } catch (requestError) {
      notify(requestError.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function deleteReview(reviewId) {
    try {
      const data = await api("/api/listings/" + id + "/reviews/" + reviewId, { method: "DELETE" });
      setListing((current) => ({ ...current, reviews: current.reviews.filter((review) => review._id !== reviewId) }));
      notify(data.message);
    } catch (requestError) {
      notify(requestError.message, "error");
    }
  }

  if (loading) return <Loading />;
  if (error) return <ErrorPanel message={error} />;
  if (!listing) return null;

  return (
    <section className="detail-page">
      <p className="eyebrow">{listing.displayCategory}</p>
      <div className="detail-heading">
        <div>
          <h1>{listing.title}</h1>
          <p className="listing-location">{[listing.location, listing.country].filter(Boolean).join(", ")}</p>
        </div>
        {ownsListing && <div className="detail-actions">
          <Link className="btn btn-outline-dark" to={"/listings/" + id + "/edit"}>Edit</Link>
          <button className="btn btn-delete" onClick={deleteListing}>Delete</button>
        </div>}
      </div>
      <img className="detail-hero" src={imageFor(listing)} alt={listing.title} />
      <div className="detail-columns">
        <div className="detail-main">
          <div className="detail-host">
            <span className="host-avatar">{(listing.owner?.username || "W").charAt(0).toUpperCase()}</span>
            <div><strong>Hosted by {listing.owner?.username || "Wanderlust host"}</strong><span>Comfortable stays, thoughtfully selected</span></div>
          </div>
          <p className="detail-description">{listing.description}</p>
          <div className="detail-facts">
            <span><i className="fa-solid fa-location-dot" />{listing.location}</span>
            <span><i className="fa-solid fa-earth-asia" />{listing.country}</span>
            <span><i className="fa-solid fa-tag" />{listing.displayCategory}</span>
          </div>
          <h2 className="section-title">Guest reviews <span>({listing.reviews?.length || 0})</span></h2>
          {user && <form className="review-form" onSubmit={submitReview}>
            <label className="form-label" htmlFor="review-rating">Your rating</label>
            <select id="review-rating" className="form-select" value={rating} onChange={(event) => setRating(event.target.value)}>
              {[5, 4, 3, 2, 1].map((value) => <option value={value} key={value}>{value} {value === 1 ? "star" : "stars"}</option>)}
            </select>
            <label className="form-label mt-3" htmlFor="review-comment">Share your experience</label>
            <textarea id="review-comment" className="form-control" rows="3" value={comment} onChange={(event) => setComment(event.target.value)} required />
            <button className="btn btn-primary mt-3" disabled={busy}>{busy ? "Submitting…" : "Submit review"}</button>
          </form>}
          <div className="review-grid">
            {(listing.reviews || []).map((review) => <article className="review-card" key={review._id}>
              <div className="review-head"><strong>{review.author?.username || "Guest"}</strong><span><i className="fa-solid fa-star" /> {review.rating}/5</span></div>
              <p>{review.comment}</p>
              {user && String(review.author?._id || review.author) === String(user.id) && <button className="text-button" onClick={() => deleteReview(review._id)}>Delete review</button>}
            </article>)}
          </div>
        </div>
        <aside className="booking-card">
          <p><strong>{money(listing.price)}</strong> <span>/ night</span></p>
          <p className="booking-location">{listing.location}, {listing.country}</p>
          <Link className="btn btn-primary w-100" to="/listings">Explore more stays</Link>
        </aside>
      </div>
      <section className="map-section"><h2 className="section-title">Where you'll be</h2><MapView listing={listing} token={mapToken} /></section>
    </section>
  );
}
