import { useEffect, useState } from "react";

function BuyCrops() {
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(null);

  useEffect(() => {
  fetch("http://localhost:5000/api/crops")
    .then(r => r.json())
    .then(data => setCrops(data.crops || []));
  }, []);

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
        {crops.map((crop) => (
          <div className="card" key={crop._id}>
            <div className="image-box">
              <img src={crop.image || "https://via.placeholder.com/300"} />
              <span className="badge">{crop.quantity} KG Available</span>
            </div>

            <h2>{crop.name}</h2>

            <p className="farmer">Farmer: {crop.farmerName}</p>
            <p className="farmer">Mobile: {crop.farmerMobile || "Not added"}</p>

            <div className="price-box">
              <span>EXPECTED PRICE</span>
              <h3>Rs {crop.price} / kg</h3>
            </div>

            <button className="offer-btn" onClick={() => setSelectedCrop(crop)}>
              MAKE OFFER
            </button>
          </div>
        ))}
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

            <button onClick={() => setSelectedCrop(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default BuyCrops;
