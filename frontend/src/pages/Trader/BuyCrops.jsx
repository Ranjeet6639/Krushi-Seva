import { useEffect, useState } from "react";
import api from "../../lib/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:5000";

function BuyCrops() {
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/crops")
      .then(r => setCrops(r.data.crops || []))
      .catch(() => setError("Failed to load crops. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: "2rem" }}>Loading crops...</p>;
  if (error)   return <p style={{ padding: "2rem", color: "red" }}>{error}</p>;

  return (
    <>
      <div className="header">
        <div>
          <h1>Available Crops</h1>
          <p>Fresh produce from nearby farmers</p>
        </div>
        <button className="filter-btn">Filter Search</button>
      </div>

      <div className="grid">
        {crops.length === 0 ? (
          <p>No crops available right now.</p>
        ) : (
          crops.map((crop) => (
            <div className="card" key={crop._id}>
              <div className="image-box">
                <img
                  src={crop.image || "https://via.placeholder.com/300x200?text=No+Image"}
                  alt={crop.name}
                  className="crop-image"
                  onError={(e) => { e.target.src = "https://via.placeholder.com/300"; }}
                />
                <span className="badge">{crop.quantity} KG Available</span>
              </div>

              <h2>{crop.name}</h2>
              <p className="farmer">Farmer: {crop.farmerName}</p>
              <p className="farmer">Mobile: {crop.farmerMobile || "Not added"}</p>

              <div className="price-box">
                <span>EXPECTED PRICE</span>
                <h3>Rs {crop.price} / kg</h3>
              </div>

              <button className="farmer-details-btn" onClick={() => setSelectedCrop(crop)}>
                FARMER DETAILS
              </button>
            </div>
          ))
        )}
      </div>

      {selectedCrop && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Farmer Details</h2>
            <p><b>Name:</b> {selectedCrop.farmerName}</p>
            <p><b>Mobile:</b> {selectedCrop.farmerMobile || "Not added"}</p>
            <p><b>Farmer ID:</b> {selectedCrop.farmerId || "Not added"}</p>
            <p><b>Village:</b> {selectedCrop.farmerVillage || "Not added"}</p>
            <p><b>Address:</b> {selectedCrop.farmerAddress || "Address not added"}</p>
            <button onClick={() => setSelectedCrop(null)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

export default BuyCrops;