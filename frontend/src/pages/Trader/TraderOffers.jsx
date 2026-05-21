import { useEffect, useState } from "react";
import api from "../../lib/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:5000";

function TraderOffers() {
  const [crops, setCrops]           = useState([]);
  const [myOffers, setMyOffers]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    offerPrice: "",
    quantity: "",
    message: ""
  });

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

  // Check trader profile completeness
  const isProfileComplete = !!(
    currentUser?.mobile &&
    currentUser?.state &&
    currentUser?.district &&
    currentUser?.address
  );

  useEffect(() => {
    // Fetch all available crops
    api.get("/crops")
      .then(r => setCrops(r.data.crops || []))
      .catch(() => setError("Failed to load crops."))
      .finally(() => setLoading(false));

    // Fetch trader's own offers
    api.get("/offers/trader")
      .then(r => setMyOffers(r.data.offers || []))
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    // Profile completeness check
    if (!isProfileComplete) {
      setError(
        "Your profile is incomplete. Please add your mobile, state, district and address in My Profile before making an offer."
      );
      return;
    }

    if (!form.offerPrice || !form.quantity) {
      setError("Offer price and quantity are required.");
      return;
    }

    if (Number(form.offerPrice) <= 0) {
      setError("Offer price must be greater than 0.");
      return;
    }

    if (Number(form.quantity) <= 0 || Number(form.quantity) > selectedCrop.quantity) {
      setError(`Quantity must be between 1 and ${selectedCrop.quantity} KG.`);
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/offers", {
        cropId:       selectedCrop._id,
        cropName:     selectedCrop.name,
        farmerId:     selectedCrop.farmerId,
        farmerName:   selectedCrop.farmerName,
        offerPrice:   Number(form.offerPrice),
        quantity:     Number(form.quantity),
        message:      form.message,
        traderName:   currentUser.name,
        traderMobile: currentUser.mobile,
        traderEmail:  currentUser.email,
        traderAddress: currentUser.address,
        traderCode:   currentUser.userCode
      });

      setSuccessMsg(`Offer submitted for ${selectedCrop.name}!`);
      setSelectedCrop(null);
      setForm({ offerPrice: "", quantity: "", message: "" });

      // Refresh my offers list
      const updated = await api.get("/offers/trader");
      setMyOffers(updated.data.offers || []);

    } catch (err) {
        console.error("Full error:", err.response?.data);
      setError(err?.response?.data?.message || "Failed to submit offer.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p style={{ padding: "2rem" }}>Loading crops...</p>;

  return (
    <div style={{ padding: "24px" }}>

      <h2 style={{ marginBottom: "4px" }}>Make an Offer</h2>
      <p style={{ color: "#666", fontSize: "14px", marginBottom: "24px" }}>
        Browse available crops and submit your price offer to farmers.
      </p>

      {/* Profile incomplete warning */}
      {!isProfileComplete && (
        <div style={{
          background: "#fff3e0",
          border: "1px solid #ff9800",
          borderRadius: "10px",
          padding: "14px 18px",
          marginBottom: "20px",
          fontSize: "14px",
          color: "#e65100"
        }}>
          ⚠️ Your profile is incomplete. Please go to <b>My Profile</b> and fill in your
          mobile, state, district and address before making an offer.
        </div>
      )}

      {successMsg && (
        <div style={{
          background: "#e8f5e9",
          border: "1px solid #4caf50",
          borderRadius: "10px",
          padding: "12px 18px",
          marginBottom: "20px",
          fontSize: "14px",
          color: "#2e7d32"
        }}>
          ✓ {successMsg}
        </div>
      )}

      {error && (
        <div style={{
          background: "#fdecea",
          border: "1px solid #f44336",
          borderRadius: "10px",
          padding: "12px 18px",
          marginBottom: "20px",
          fontSize: "14px",
          color: "#c62828"
        }}>
          {error}
        </div>
      )}

      {/* Crops grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "16px",
        marginBottom: "40px"
      }}>
        {crops.length === 0 ? (
          <p>No crops available right now.</p>
        ) : (
          crops.map((crop) => (
            <div key={crop._id} style={{
              background: "white",
              borderRadius: "14px",
              padding: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              border: selectedCrop?._id === crop._id ? "2px solid #2e7d32" : "1px solid #f0f0f0"
            }}>
              <img
                src={crop.image ? `${BASE_URL}${crop.image}` : "https://via.placeholder.com/200x120"}
                alt={crop.name}
                style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "10px" }}
                onError={(e) => { e.target.src = "https://via.placeholder.com/200x120"; }}
              />

              <h3 style={{ margin: "12px 0 4px", fontSize: "17px" }}>{crop.name}</h3>
              <p style={{ color: "#666", fontSize: "13px", margin: "2px 0" }}>
                Farmer: {crop.farmerName}
              </p>
              <p style={{ color: "#666", fontSize: "13px", margin: "2px 0" }}>
                Available: {crop.quantity} KG
              </p>
              <p style={{ color: "#1b8f5a", fontWeight: "600", margin: "6px 0" }}>
                Expected: ₹{crop.price}/kg
              </p>

              <button
                onClick={() => {
                  setSelectedCrop(crop);
                  setForm({ offerPrice: "", quantity: "", message: "" });
                  setError("");
                  setSuccessMsg("");
                }}
                style={{
                  width: "100%",
                  marginTop: "10px",
                  padding: "10px",
                  background: "linear-gradient(135deg, #1b8f5a, #2fbf71)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "14px"
                }}
              >
                Make Offer
              </button>
            </div>
          ))
        )}
      </div>

      {/* Offer form modal */}
      {selectedCrop && (
        <div style={{
          position: "fixed",
          top: 0, left: 0,
          width: "100%", height: "100%",
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "28px",
            width: "420px",
            maxWidth: "90vw",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
          }}>
            <h3 style={{ marginBottom: "4px" }}>Make Offer for {selectedCrop.name}</h3>
            <p style={{ color: "#666", fontSize: "13px", marginBottom: "20px" }}>
              Farmer expects ₹{selectedCrop.price}/kg · {selectedCrop.quantity} KG available
            </p>

            {error && (
              <p style={{
                color: "#c62828", fontSize: "13px",
                background: "#fdecea", padding: "10px",
                borderRadius: "8px", marginBottom: "14px"
              }}>
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit}>

              <label style={{ fontSize: "13px", fontWeight: "500", color: "#444" }}>
                Your Offer Price (₹ per kg) *
              </label>
              <input
                name="offerPrice"
                type="number"
                value={form.offerPrice}
                onChange={handleChange}
                placeholder={`Farmer expects ₹${selectedCrop.price}/kg`}
                required
                style={{
                  width: "100%", padding: "10px 12px",
                  border: "1px solid #ddd", borderRadius: "8px",
                  fontSize: "14px", marginBottom: "14px",
                  boxSizing: "border-box"
                }}
              />

              <label style={{ fontSize: "13px", fontWeight: "500", color: "#444" }}>
                Quantity Required (KG) *
              </label>
              <input
                name="quantity"
                type="number"
                value={form.quantity}
                onChange={handleChange}
                placeholder={`Max ${selectedCrop.quantity} KG`}
                required
                style={{
                  width: "100%", padding: "10px 12px",
                  border: "1px solid #ddd", borderRadius: "8px",
                  fontSize: "14px", marginBottom: "14px",
                  boxSizing: "border-box"
                }}
              />

              <label style={{ fontSize: "13px", fontWeight: "500", color: "#444" }}>
                Message to Farmer (optional)
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Any special requirements or notes..."
                rows={3}
                style={{
                  width: "100%", padding: "10px 12px",
                  border: "1px solid #ddd", borderRadius: "8px",
                  fontSize: "14px", marginBottom: "18px",
                  boxSizing: "border-box", resize: "vertical"
                }}
              />

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => { setSelectedCrop(null); setError(""); }}
                  style={{
                    flex: 1, padding: "11px",
                    background: "#f5f5f5", border: "1px solid #ddd",
                    borderRadius: "8px", cursor: "pointer",
                    fontSize: "14px", fontWeight: "500"
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 2, padding: "11px",
                    background: submitting ? "#aaa" : "linear-gradient(135deg, #1b8f5a, #2fbf71)",
                    color: "white", border: "none",
                    borderRadius: "8px", cursor: submitting ? "not-allowed" : "pointer",
                    fontSize: "14px", fontWeight: "600"
                  }}
                >
                  {submitting ? "Submitting..." : "Submit Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* My submitted offers */}
      <h3 style={{ marginBottom: "16px" }}>My Submitted Offers</h3>

      {myOffers.length === 0 ? (
        <p style={{ color: "#888", fontSize: "14px" }}>You haven't submitted any offers yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {myOffers.map((offer) => (
            <div key={offer._id} style={{
              background: "white",
              borderRadius: "12px",
              padding: "16px 20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px"
            }}>
              <div>
                <h4 style={{ margin: "0 0 4px", fontSize: "16px" }}>{offer.cropName}</h4>
                <p style={{ margin: "2px 0", fontSize: "13px", color: "#666" }}>
                  Farmer: {offer.farmerName}
                </p>
                <p style={{ margin: "2px 0", fontSize: "13px", color: "#666" }}>
                  Your offer: ₹{offer.offerPrice}/kg · {offer.quantity} KG
                </p>
                {offer.message && (
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#999" }}>
                    "{offer.message}"
                  </p>
                )}
              </div>

              <span style={{
                padding: "5px 14px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600",
                background: offer.status === "Accepted" ? "#e8f5e9"
                  : offer.status === "Rejected" ? "#fdecea"
                  : "#fff8e1",
                color: offer.status === "Accepted" ? "#2e7d32"
                  : offer.status === "Rejected" ? "#c62828"
                  : "#f57c00",
                whiteSpace: "nowrap"
              }}>
                {offer.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TraderOffers;