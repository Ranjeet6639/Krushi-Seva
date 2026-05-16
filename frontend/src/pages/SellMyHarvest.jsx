import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import "./SellMyHarvest.css";
import api from "../lib/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:5000";

function SellMyHarvest() {
  const navigate = useNavigate();
  const [crops, setCrops] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [navLoading, setNavLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const handleBack = () => {
    setNavLoading(true);
    setTimeout(() => {
      navigate("/farmerdashboard");
    }, 1000);
  };

  useEffect(() => {

  const fetchCrops = async () => {

    try {

      const user = JSON.parse(
        localStorage.getItem("currentUser") || "null"
      );

      if (user) {
        setCurrentUser(user);
      }

      const response = await api.get(`/crops/farmer/${user?.userCode}`);

      setCrops(response.data.crops || []);

    } catch (err) {

      console.error(err);

    }

  };

  fetchCrops();

  }, []);

  const deleteCrop = async (id) => {

  try {
    await api.delete(`/crops/${id}`);

    setCrops(
      crops.filter(c => c._id !== id)
    );

  } catch (err) {

    console.error(err);

    alert(
      err?.response?.data?.message ||
      "Failed to delete crop"
    );

  }

  };

  const displayName = currentUser?.name || "Farmer";
  const displayEmail = currentUser?.email || "Not added";
  const displayPhone = currentUser?.mobile || "Not added";
  const displayVillage = currentUser?.profile?.village || "Not added";
  const displayDistrict = currentUser?.district || "Not added";
  const displayState = currentUser?.state || "Not added";
  const displayAddress = currentUser?.address || "Not added";
  const displayFarmerId = currentUser?.userCode || "FR-000000";

  return (
    <>
      <div className="Sell-Header">
        <header className="header">
          <div className="logo">🌱 <span>Krushi Seva</span></div>
          <button className="lang-btn">🌐 English / हिन्दी</button>

          <button onClick={handleBack} className="back-btn" disabled={navLoading}>
            <Home size={20} />
            {navLoading ? "Loading..." : "Back to Home"}
          </button>
        </header>
      </div>

      <div className="harvest-container">
        <div className="harvest-sidebar">
          <button className="active-btn">Sell Crops</button>
          <button onClick={() => setShowProfile(true)}>My Profile</button>
          <button onClick={() => navigate("/offersreceived")}>Offers Received</button>
          <button onClick={() => navigate("/farmerlogout")}>Logout</button>

          <div className="farmer-id">
            <p>FARMER ID</p>
            <h3>{displayFarmerId}</h3>
          </div>
        </div>

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

            <button className="new-crop-btn" onClick={() => navigate("/listcrop")}>
              + List New Crop
            </button>
          </div>

          <div className="crop-list">
            {crops.length === 0 ? (
              <p>No crops listed yet</p>
            ) : (
              crops.map((crop) => (
                <div key={crop._id} className="crop-card">
                  <img
                    src={crop.image ? `${BASE_URL}${crop.image}` : "https://via.placeholder.com/80"}
                    alt="crop"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/80"; }}
                    />
                  <div className="crop-info">
                    <h3>{crop.name}</h3>
                    <p>{crop.quantity} KG</p>

                    <span className={`status ${crop.status || "active"}`}>
                      {crop.status || "Active"}
                    </span>
                  </div>

                  <button className="delete-btn" onClick={() => deleteCrop(crop._id)}>
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {showProfile && (
          <div className="profile-modal">
            <div className="profile-card">
              <h2>Farmer Profile</h2>

              <p><b>Name:</b> {displayName}</p>
              <p><b>Email:</b> {displayEmail}</p>
              <p><b>Phone:</b> {displayPhone}</p>
              <p><b>Village:</b> {displayVillage}</p>
              <p><b>District:</b> {displayDistrict}</p>
              <p><b>State:</b> {displayState}</p>
              <p><b>Address:</b> {displayAddress}</p>
              <p><b>Ration Card:</b> {currentUser?.profile?.ration || "Not added"}</p>

              <button className="close-btn" onClick={() => setShowProfile(false)}>
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
