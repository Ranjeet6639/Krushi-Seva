import "./TraderDashboard.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BuyCrops from "./BuyCrops";
import TraderProfile from "./TraderProfile";
import TraderLogout from "./TraderLogout";

function TraderDashboard() {

  const [activePage, setActivePage] = useState("buy");
  const navigate = useNavigate(); // ✅ added

  return (
    <div className="dashboard">

      {/* SIDEBAR */}
      <div className="sidebar">
        <h2 className="logo">🌱 Krushi Seva</h2>

        <button
          className={activePage === "buy" ? "active" : ""}
          onClick={() => setActivePage("buy")}
        >
          🛒 1. Buy Crops
        </button>

        <button
          className={activePage === "profile" ? "active" : ""}
          onClick={() => setActivePage("profile")}
        >
          👤 2. My Profile
        </button>

        {/* ✅ LOGOUT BUTTON ADDED */}
        <button
          className="logout-btn"
          onClick={() => navigate("/Trader/TraderLogout")}
        >
          🚪 Logout
        </button>

        <div className="trader-id">
          TRADER ID<br/>TR-88219
        </div>
      </div>

      {/* RIGHT SIDE (DYNAMIC) */}
      <div className="main">

        {activePage === "buy" && <BuyCrops />}
        {activePage === "profile" && <TraderProfile />}

      </div>

    </div>
  );
}

export default TraderDashboard;