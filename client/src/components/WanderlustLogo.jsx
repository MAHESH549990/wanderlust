import React from "react";

export default function WanderlustLogo({ className = "" }) {
  return (
    <span className={"wanderlust-mark " + className} aria-hidden="true">
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 44S9 29.4 9 19.5a15 15 0 1 1 30 0C39 29.4 24 44 24 44Z" fill="currentColor" />
        <circle cx="24" cy="19.5" r="9.4" stroke="white" strokeWidth="1.8" />
        <path d="m26.2 13.4-1.7 5.4-5.4 1.7 1.7-5.4 5.4-1.7Z" fill="white" />
        <path d="m21.8 25.6 1.7-5.4 5.4-1.7-1.7 5.4-5.4 1.7Z" fill="white" opacity=".76" />
        <circle cx="24" cy="19.5" r="1.45" fill="currentColor" />
      </svg>
    </span>
  );
}
