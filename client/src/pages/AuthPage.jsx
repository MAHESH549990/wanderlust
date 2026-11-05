import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useApp } from "../context/AppContext.jsx";
import WanderlustLogo from "../components/WanderlustLogo.jsx";

export default function AuthPage({ signup = false }) {
  const { setUser, notify } = useApp();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const data = await api(signup ? "/api/auth/signup" : "/api/auth/login", { method: "POST", body });
      setUser(data.user);
      notify(data.message);
      navigate(data.redirectTo || "/listings");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-mark"><WanderlustLogo /></div>
        <p className="eyebrow">{signup ? "START EXPLORING" : "WELCOME BACK"}</p>
        <h1>{signup ? "Create your account" : "Log in to Wanderlust"}</h1>
        <p className="auth-description">{signup ? "Save the places you love and plan your next getaway." : "Your next favorite stay is waiting."}</p>
        {error && <p className="inline-error" role="alert">{error}</p>}
        <form className="auth-form" onSubmit={submit}>
          <label className="form-label" htmlFor="auth-username">Username</label>
          <input id="auth-username" className="form-control" name="username" autoComplete="username" placeholder={signup ? "Choose a username" : "Enter your username"} required />
          {signup && <>
            <label className="form-label mt-3" htmlFor="auth-email">Email address</label>
            <input id="auth-email" className="form-control" type="email" name="email" autoComplete="email" placeholder="you@example.com" required />
          </>}
          <label className="form-label mt-3" htmlFor="auth-password">Password</label>
          <input id="auth-password" className="form-control" type="password" name="password" autoComplete={signup ? "new-password" : "current-password"} placeholder={signup ? "Create a password" : "Enter your password"} required />
          <button className="btn btn-primary w-100 auth-submit mt-4" disabled={busy}>{busy ? "Please wait…" : signup ? "Create account" : "Log in"}</button>
        </form>
        <p className="auth-switch">{signup ? "Already have an account?" : "New to Wanderlust?"} <Link to={signup ? "/login" : "/signup"}>{signup ? "Log in" : "Create an account"}</Link></p>
      </div>
    </section>
  );
}
