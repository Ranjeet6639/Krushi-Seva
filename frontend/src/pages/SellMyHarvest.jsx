import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import "./SellMyHarvest.css";

function SellMyHarvest() {
  const navigate = useNavigate();
  const [crops, setCrops] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [navLoading, setNavLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const handleBack = () => {
    setNavLoading(true);
    setTimeout(() => {
      navigate("/FarmerDashboard");
    }, 1000);
  };

  useEffect(() => {
  const user = JSON.parse(localStorage.getItem("currentUser") || "null");
  if (user) setCurrentUser(user);

  fetch(`http://localhost:5000/api/crops/farmer/${user?.userCode}`)
    .then(r => r.json())
    .then(data => setCrops(data.crops || []));
  }, []);

  const deleteCrop = async (id) => {
  await fetch(`http://localhost:5000/api/crops/${id}`, { method: "DELETE" });
  setCrops(crops.filter(c => c._id !== id));
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
                  <img src={crop.image || "https://via.placeholder.com/80"} alt="crop" />

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
