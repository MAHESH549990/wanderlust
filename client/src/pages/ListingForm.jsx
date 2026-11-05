import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, imageFor } from "../api.js";
import { ErrorPanel, Loading } from "../components/PageStates.jsx";
import { categoryOptions } from "../data/listingCategories.js";
import { useApp } from "../context/AppContext.jsx";

export default function ListingForm({ edit = false }) {
  const { id } = useParams();
  const { notify } = useApp();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(edit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!edit) return;
    api("/api/listings/" + id)
      .then((data) => setListing(data.listing))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [edit, id]);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const data = await api(edit ? "/api/listings/" + id : "/api/listings", {
        method: edit ? "PUT" : "POST",
        body: form,
      });
      notify(data.message);
      navigate("/listings/" + data.listing._id);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loading />;
  return (
    <section className="form-page">
      <header className="form-page-heading">
        <p className="eyebrow">{edit ? "UPDATE YOUR STAY" : "SHARE A STAY"}</p>
        <h1>{edit ? "Edit listing" : "List your place"}</h1>
        <p className="page-subtitle">{edit ? "Keep the details current for your guests." : "Add a few details to help guests find your stay."}</p>
      </header>
      {error && <ErrorPanel message={error} />}
      <form className="listing-form" onSubmit={submit}>
        <label className="form-label" htmlFor="listing-title">Title</label>
        <input id="listing-title" className="form-control" name="title" defaultValue={listing?.title || ""} placeholder="A quiet cabin by the lake" required />

        <label className="form-label mt-3" htmlFor="listing-description">Description</label>
        <textarea id="listing-description" className="form-control" name="description" defaultValue={listing?.description || ""} rows="5" required />

        <label className="form-label mt-3" htmlFor="listing-category">Category</label>
        <select id="listing-category" className="form-select" name="category" defaultValue={listing?.category || ""}>
          <option value="">Choose a category</option>
          {categoryOptions.map((category) => <option key={category}>{category}</option>)}
        </select>

        <div className="form-row">
          <div>
            <label className="form-label mt-3" htmlFor="listing-price">Price per night (₹)</label>
            <input id="listing-price" className="form-control" type="number" min="1" name="price" defaultValue={listing?.price || ""} required />
          </div>
          <div>
            <label className="form-label mt-3" htmlFor="listing-country">Country</label>
            <input id="listing-country" className="form-control" name="country" defaultValue={listing?.country || ""} required />
          </div>
        </div>

        <label className="form-label mt-3" htmlFor="listing-location">Location</label>
        <input id="listing-location" className="form-control" name="location" defaultValue={listing?.location || ""} required />

        {edit && listing?.image?.url && <img className="form-preview" src={imageFor(listing)} alt="Current listing" />}
        <label className="form-label mt-3" htmlFor="listing-image">{edit ? "Replace photo (optional)" : "Listing photo"}</label>
        <input id="listing-image" className="form-control" type="file" name="image" accept="image/*" required={!edit} />

        <button className="btn btn-primary mt-4" disabled={saving}>{saving ? "Saving…" : edit ? "Save changes" : "Create listing"}</button>
      </form>
    </section>
  );
}
