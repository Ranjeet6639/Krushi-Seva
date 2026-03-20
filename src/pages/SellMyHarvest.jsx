import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import "./SellMyHarvest.css";

function SellMyHarvest() {

  const navigate = useNavigate();

  const [crops, setCrops] = useState([]);
  const [showProfile, setShowProfile] = useState(false);

  // ✅ NEW NAV LOADING STATE
  const [navLoading, setNavLoading] = useState(false);

  // ✅ BACK BUTTON FUNCTION
  const handleBack = () => {
    setNavLoading(true);
    setTimeout(() => {
      navigate("/FarmerDashboard");
    }, 1000);
  };

  // ✅ LOAD CROPS FROM LOCAL STORAGE
  useEffect(() => {
    const storedCrops = JSON.parse(localStorage.getItem("crops")) || [];
    setCrops(storedCrops);
  }, []);

  // ✅ DELETE CROP
  const deleteCrop = (id) => {
    const updatedCrops = crops.filter((crop) => crop.id !== id);
    setCrops(updatedCrops);
    localStorage.setItem("crops", JSON.stringify(updatedCrops));
  };

  return (
    <>
      <div className="Sell-Header">
        <header className="header">
          <div className="logo">🌱 <span>Krushi Seva</span></div>
          <button className="lang-btn">🌐 English / हिन्दी</button>

          {/* ✅ BACK BUTTON ADDED */}
          <button onClick={handleBack} className="back-btn" disabled={navLoading}>
            <Home size={20} />
            {navLoading ? "⏳ Loading..." : "Back to Home"}
          </button>

        </header>
      </div>

      <div className="harvest-container">

        {/* SIDEBAR */}
        <div className="harvest-sidebar">

          <button className="active-btn">🏠 Sell Crops</button>

          <button onClick={() => setShowProfile(true)}>👤 My Profile</button>

          <button onClick={() => navigate("/offersreceived")}>
            💰 Offers Received
          </button>

          <button onClick={() => navigate("/farmerlogout")}>
            🚪 Logout
          </button>

          <div className="farmer-id">
            <p>MAGLER ID</p>
            <h3>TR-72810</h3>
          </div>

        </div>

        {/* MAIN */}
        <div className="harvest-main">

          <div className="harvest-header">
            <h1>My Crops</h1>
            <p>Manage the crops you have listed for sale.</p>
          </div>

          <div className="top-controls">

            <select>
              <option>All Crops</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Sold</option>
            </select>

            <button
              className="new-crop-btn"
              onClick={() => navigate("/listcrop")}
            >
              + List New Crop
            </button>

          </div>

          {/* CROPS LIST */}
          <div className="crop-list">

            {crops.length === 0 ? (
              <p>No crops listed yet</p>
            ) : (
              crops.map((crop) => (

                <div key={crop.id} className="crop-card">

                  <img
                    src={crop.image || "https://via.placeholder.com/80"}
                    alt="crop"
                  />

                  <div className="crop-info">
                    <h3>{crop.name}</h3>
                    <p>{crop.quantity} KG</p>

                    <span className={`status ${crop.status || "active"}`}>
                      {crop.status || "Active"}
                    </span>
                  </div>

                  <button
                    className="delete-btn"
                    onClick={() => deleteCrop(crop.id)}
                  >
                    Delete
                  </button>

                </div>

              ))
            )}

          </div>

        </div>

        {/* PROFILE */}
        {showProfile && (
          <div className="profile-modal">
            <div className="profile-card">

              <h2>Farmer Profile</h2>

              <p><b>Name:</b> Ramesh Patil</p>
              <p><b>Email:</b> ramesh@gmail.com</p>
              <p><b>Phone:</b> 9876543210</p>
              <p><b>Village:</b> Nashik</p>
              <p><b>Farm Size:</b> 5 Acres</p>

              <button
                className="close-btn"
                onClick={() => setShowProfile(false)}
              >
                Close
              </button>

            </div>
          </div>
        )}

      </div>
    </>
  );
}

export default SellMyHarvest;