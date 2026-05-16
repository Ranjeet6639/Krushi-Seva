import "./FarmerDashboard.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import whatToGrow from "../assets/what-to-grow.jpg";
import sickCrops from "../assets/sick-crops.jpg";
import sellHarvest from "../assets/sell-harvest.jpg";
import api from "../lib/api";

function FarmerDashboard() {
  const [crops, setCrops] = useState([]);
  const navigate = useNavigate();
  const [showAccount, setShowAccount] = useState(false);
  const [slide, setSlide] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  const advice = [
    {
      title: "Earn More: Switch to Millets",
      text: "Prices for Millets are 20% higher than Wheat this month. They also use less water.",
      img: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc"
    },
    {
      title: "Soybean Market Rising",
      text: "Soybean demand rising in nearby mandis.",
      img: "https://images.unsplash.com/photo-1598514982846-8c92e3c0c9b1"
    },
    {
      title: "Rice Demand Increasing",
      text: "Rice prices increased 15% this week.",
      img: "https://images.unsplash.com/photo-1586201375761-83865001e31c"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSlide((prev) => (prev + 1) % advice.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [advice.length]);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");

    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  },
  
  useEffect(() => {
  const user = JSON.parse(localStorage.getItem("currentUser") || "null");
  const token = localStorage.getItem("token");
  if (user?.userCode && token) {
    api.get(`/crops/farmer/${user.userCode}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => setCrops(r.data.crops || [])).catch(console.error);
  }
  }, []));

  const displayName = currentUser?.name || "Farmer";
  const displayVillage = currentUser?.profile?.village || currentUser?.district || "Village not added";
  const displayDistrict = currentUser?.district || "District not added";
  const displayState = currentUser?.state || "State not added";
  const displayAddress = currentUser?.address || "Address not added";
  const displayMobile = currentUser?.mobile || "Mobile not added";
  const displayEmail = currentUser?.email || "Email not added";
  const avatarLabel =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "F";

  return (
    <div className="farmerdashboard">
      <div className="dashboard-header">
        <div className="brand">
          <span>🌱</span>
          <div>
            <h2>Krushi Seva</h2>
            <p>Your Farm Assistant</p>
          </div>
        </div>

        <div className="account-section">
          <div className="account-info">
            <strong>{displayName}</strong>
            <span>Village: {displayVillage}</span>
          </div>

          <button
            className="avatar"
            type="button"
            onClick={() => setShowAccount((currentValue) => !currentValue)}
          >
            {avatarLabel}
          </button>

          {showAccount && (
            <div className="account-popup">
              <p><b>Name:</b> {displayName}</p>
              <p><b>Village:</b> {displayVillage}</p>
              <p><b>District:</b> {displayDistrict}</p>
              <p><b>State:</b> {displayState}</p>
              <p><b>Farmer Address:</b> {displayAddress}</p>
              <p><b>Mobile:</b> {displayMobile}</p>
              <p><b>Email:</b> {displayEmail}</p>

              <button
                className="logout-btn"
                onClick={() => navigate("/farmerlogout")}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="action-cards">
        <div className="action-card" onClick={() => navigate("/whattogrow")}>
          <img src={whatToGrow} className="card-icon" />
          <h3>NEW:<br />WHAT TO GROW?</h3>
        </div>

        <div className="action-card" onClick={() => navigate("/sickcrops")}>
          <img src={sickCrops} className="card-icon" />
          <h3>CHECK<br />SICK CROPS</h3>
        </div>

        <div className="action-card" onClick={() => navigate("/sellmyharvest")}>
          <img src={sellHarvest} className="card-icon" />
          <h3>SELL MY<br />HARVEST</h3>
        </div>
      </div>

      <div className="advice-card">
        <img src={advice[slide].img} />

        <div className="advice-text">
          <span className="farmerbadge">SMART ADVICE</span>
          <h2>{advice[slide].title}</h2>
          <p>{advice[slide].text}</p>
          <button className="later-btn">Maybe Later</button>
        </div>
      </div>

      <div className="listings">
        <div className="listing-box">
          <h3>Active Listings</h3>

          <div className="listing-item">
            <div>
              <b>Organic Wheat</b>
              <p>150 Quintals</p>
            </div>
            <span>₹2,100/q</span>
          </div>

          <div className="listing-item">
            <div>
              <b>Basmati Rice</b>
              <p>80 Quintals</p>
            </div>
            <span>₹2,850/q</span>
          </div>
        </div>

        <div className="listing-box">
        <h3>Active Listings</h3>
        {crops.length === 0 ? (
        <p style={{ fontSize: "14px", color: "#888" }}>No crops listed yet.</p>
        ) : (
        crops.slice(0, 3).map((crop) => (
        <div className="listing-item" key={crop._id}>
         <div>
          <b>{crop.name}</b>
          <p>{crop.quantity} KG</p>
        </div>
        <span>₹{crop.price}/kg</span>
      </div>
   ))
 )}

          <div className="listing-item">
            <div>AgroCorp Ind.</div>
            <span>₹2,200/q</span>
          </div>

          <div className="listing-item">
            <div>S.K. Exports</div>
            <span>₹2,950/q</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FarmerDashboard;
