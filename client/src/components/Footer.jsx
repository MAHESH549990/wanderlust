import React from "react";

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <span>© {new Date().getFullYear()} Wanderlust</span>
        <span>Find a place that feels like yours.</span>
      </div>
    </footer>
  );
}
