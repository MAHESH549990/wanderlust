import React from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { Loading } from "../components/PageStates.jsx";

export default function ProfilePage() {
  const { user } = useApp();
  if (!user) return <Loading />;
  return (
    <section className="profile-page">
      <div className="profile-card">
        <div className="profile-avatar">{(user.username || "W").charAt(0).toUpperCase()}</div>
        <p className="eyebrow">YOUR ACCOUNT</p>
        <h1>{user.username}</h1>
        <p className="profile-intro">Manage your Wanderlust account details.</p>
        <div className="profile-details">
          <div><span className="profile-label">Username</span><strong>{user.username}</strong></div>
          <div><span className="profile-label">Email address</span><strong>{user.email || "Not provided"}</strong></div>
        </div>
        <Link to="/listings" className="btn btn-primary profile-action"><i className="fa-solid fa-compass" /> Explore stays</Link>
      </div>
    </section>
  );
}
