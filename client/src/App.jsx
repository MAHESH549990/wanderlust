import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { NotFound, RequireUser } from "./components/PageStates.jsx";
import { AppProvider, useApp } from "./context/AppContext.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import ListingForm from "./pages/ListingForm.jsx";
import ListingPage from "./pages/ListingPage.jsx";
import ListingsPage from "./pages/ListingsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

export default function App() {
  return <AppProvider><AppLayout /></AppProvider>;
}

function AppLayout() {
  const { notice } = useApp();
  return (
    <div className="app-shell">
      <Navbar />
      {notice && <div className={"app-notice " + notice.type} role="status">{notice.message}</div>}
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/listings" replace />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/listings/new" element={<RequireUser><ListingForm /></RequireUser>} />
          <Route path="/listings/:id/edit" element={<RequireUser><ListingForm edit /></RequireUser>} />
          <Route path="/listings/:id" element={<ListingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage signup />} />
          <Route path="/profile" element={<RequireUser><ProfilePage /></RequireUser>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
