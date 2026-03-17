import "./TraderDashboard.css";
import { useEffect, useState } from "react";

function TraderDashboard() {

  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(null);

  // ✅ LOAD FROM localStorage (instead of backend)
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("crops")) || [];
    setCrops(data);
  }, []);

  return (
    <div className="dashboard">

      {/* SIDEBAR */}
      <div className="sidebar">
        <h2 className="logo">🌱 Krushi Seva</h2>

        <button className="active">🛒 1. Buy Crops</button>
        <button>👤 2. My Profile</button>

        <div className="trader-id">TRADER ID<br/>TR-88219</div>
      </div>

      {/* MAIN */}
      <div className="main">

        <div className="header">
          <div>
            <h1>Available Crops</h1>
            <p>Fresh produce from nearby farmers</p>
          </div>

          <button className="filter-btn">⚙ Filter Search</button>
        </div>

        <div className="grid">
          {crops.map((crop) => (
            <div className="card" key={crop.id}>

              <div className="image-box">
                <img src={crop.image} alt="" />
                <span className="badge">{crop.quantity} KG Available</span>
              </div>

              <h2>{crop.name}</h2>

              <p className="farmer">👤 Farmer: {crop.farmer}</p>

              <div className="price-box">
                <span>EXPECTED PRICE</span>
                <h3>₹{crop.price} / kg</h3>
              </div>

              <button
             className="offer-btn"
             onClick={() => setSelectedCrop(crop)}
             >
             MAKE OFFER
             </button>

            </div>
          ))}
        </div>

      </div>
      
      {/* ✅ MODAL POPUP */}
      {selectedCrop && (
        <div className="modal-overlay">
          <div className="modal">

            <h2>Farmer Details</h2>

            <p><b>Name:</b> {selectedCrop.farmerName}</p>
            <p><b>Mobile:</b> {selectedCrop.farmerMobile}</p>
            <p><b>Address:</b> {selectedCrop.farmerAddress}</p>

            <button
              className="close-btn"
              onClick={() => setSelectedCrop(null)}
            >
              Close
            </button>
               </div>
        </div>
      )}
    </div>
  );
}

export default TraderDashboard;