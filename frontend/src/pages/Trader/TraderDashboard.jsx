import "./TraderDashboard.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BuyCrops from "./BuyCrops";
import TraderProfile from "./TraderProfile";
import TraderOffers from "./TraderOffers";

function TraderDashboard() {
  const [activePage, setActivePage] = useState("buy");
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
  }, []);

  const displayName     = currentUser?.name     || "Trader";
  const displayLocation = currentUser?.district || currentUser?.state || "Location not added";
  const avatarLabel =
    displayName.split(" ").filter(Boolean).slice(0, 2)
      .map((part) => part[0]?.toUpperCase()).join("") || "T";

  const pageTitle = {
    buy:     "Buy Crops",
    offers:  "My Offers",
    profile: "My Profile"
  }[activePage];

  return (
    <div className="trader-dashboard">

      {/* ── SIDEBAR ── */}
      <div className="sidebar">

        {/* Logo */}
        <h2 className="logo">🌱 Krushi Seva</h2>

        {/* Nav buttons wrapped for mobile row layout */}
        <div className="sidebar-nav">
          <button
            className={activePage === "buy" ? "active" : ""}
            onClick={() => setActivePage("buy")}
          >
            Buy Crops
          </button>

          <button
            className={activePage === "offers" ? "active" : ""}
            onClick={() => setActivePage("offers")}
          >
            My Offers
          </button>

          <button
            className={activePage === "profile" ? "active" : ""}
            onClick={() => setActivePage("profile")}
          >
            My Profile
          </button>
        </div>

        {/* Trader ID */}
        <div className="trader-id">
          {currentUser?.userCode
            ? `TRADER ID ${currentUser.userCode}`
            : "TRADER ID"}
        </div>

        {/* Logout below trader ID */}
        <button
          className="logout-btn"
          onClick={() => navigate("/Trader/TraderLogout")}
        >
          Logout
        </button>

      </div>

      {/* ── MAIN ── */}
      <div className="main">

        <div className="trader-topbar">
          <div>
            <h2>{pageTitle}</h2>
            <p>{displayLocation}</p>
          </div>

          <div className="trader-user-badge">
            <div className="trader-avatar">{avatarLabel}</div>
            <div>
              <strong>{displayName}</strong>
              <span>{currentUser?.email || "Email not added"}</span>
            </div>
          </div>
        </div>

        {activePage === "buy"     && <BuyCrops />}
        {activePage === "offers"  && <TraderOffers />}
        {activePage === "profile" && <TraderProfile />}

      </div>
    </div>
  );
}

export default TraderDashboard;
