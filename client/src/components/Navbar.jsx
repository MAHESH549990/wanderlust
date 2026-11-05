import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useApp } from "../context/AppContext.jsx";

export default function Navbar() {
  const { user, setUser, notify } = useApp();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setQuery(new URLSearchParams(location.search).get("search") || "");
    setOpen(false);
  }, [location]);

  async function logout() {
    try {
      const data = await api("/api/auth/logout", { method: "POST" });
      setUser(null);
      notify(data.message);
      navigate("/listings");
    } catch (error) {
      notify(error.message, "error");
    }
  }

  function search(event) {
    event.preventDefault();
    navigate("/listings" + (query.trim() ? "?search=" + encodeURIComponent(query.trim()) : ""));
  }

  return (
    <nav className="navbar navbar-expand-lg sticky-top">
      <div className="container-fluid navbar-shell">
        <Link className="navbar-brand" to="/listings"><i className="fa-solid fa-compass" /><span>Wanderlust</span></Link>
        <button className="navbar-toggler ms-auto" type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle navigation"><span className="navbar-toggler-icon" /></button>
        <div className={"navbar-collapse " + (open ? "show" : "")}>
          <form className="nav-search" role="search" onSubmit={search}>
            <input className="form-control" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search stays" aria-label="Search stays" />
            <button className="btn btn-primary" type="submit" aria-label="Submit search"><i className="fa-solid fa-magnifying-glass" /></button>
          </form>
          <div className="navbar-nav ms-auto align-items-lg-center">
            <NavLink className="nav-link" to="/listings"><i className="fa-solid fa-compass" />Explore</NavLink>
            <NavLink className="nav-link" to="/listings/new"><i className="fa-solid fa-plus" />Host a stay</NavLink>
            {user ? <>
              <NavLink className="nav-link" to="/profile"><i className="fa-regular fa-user" />Profile</NavLink>
              <button className="nav-link nav-button" onClick={logout}>Log out</button>
            </> : <>
              <NavLink className="nav-link" to="/login">Log in</NavLink>
              <NavLink className="nav-link nav-signup" to="/signup">Sign up</NavLink>
            </>}
          </div>
        </div>
      </div>
    </nav>
  );
}
