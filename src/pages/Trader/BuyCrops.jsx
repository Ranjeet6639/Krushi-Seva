import { useEffect, useState } from "react";

function BuyCrops() {

  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("crops")) || [];
    setCrops(data);
  }, []);

  return (
    <>

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
              <img src={crop.image || "https://via.placeholder.com/300"} />
              <span className="badge">{crop.quantity} KG Available</span>
            </div>

            <h2>{crop.name}</h2>

            <p className="farmer">
              👤 Farmer: {crop.farmerName}
            </p>

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

      {/* MODAL */}
      {selectedCrop && (
        <div className="modal-overlay">
          <div className="modal">

            <h2>Farmer Details</h2>

            <p><b>Name:</b> {selectedCrop.farmerName}</p>
            <p><b>Mobile:</b> {selectedCrop.farmerMobile}</p>
            <p><b>Address:</b> {selectedCrop.farmerAddress}</p>

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