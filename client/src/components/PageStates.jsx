import React from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

export function RequireUser({ children }) {
  const { user, sessionLoading } = useApp();
  if (sessionLoading) return <Loading />;
  return user ? children : <LinkGate />;
}

function LinkGate() {
  return <div className="empty-page"><p className="eyebrow">SIGN IN REQUIRED</p><h1>Log in to continue.</h1><Link className="btn btn-primary" to="/login">Log in</Link></div>;
}

export function Loading() {
  return <div className="loading-state"><span className="spinner-border spinner-border-sm" role="status" /> Loading…</div>;
}

export function ErrorPanel({ message }) {
  return <div className="inline-error" role="alert">{message}</div>;
}

export function NotFound() {
  return <div className="empty-page"><p className="eyebrow">404</p><h1>We couldn't find that page.</h1><Link className="btn btn-primary" to="/listings">Back to stays</Link></div>;
}
