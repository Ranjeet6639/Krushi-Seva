import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import "./OffersReceived.css";

function OffersReceived() {
  const navigate = useNavigate();
  const [offers, setOffers]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [error, setError]                 = useState("");

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

  useEffect(() => {
    if (!currentUser?.userCode) {
      setLoading(false);
      return;
    }

    api.get(`/offers/farmer/${currentUser.userCode}`)
      .then(r => setOffers(r.data.offers || []))
      .catch(() => setError("Failed to load offers."))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (offerId, status) => {
    try {
      const res = await api.patch(`/offers/${offerId}`, { status });

      const updatedOffers = offers.map(o =>
        o._id === offerId ? { ...o, status: res.data.offer.status } : o
      );
      setOffers(updatedOffers);

      if (status === "Accepted") {
        const acceptedOffer = offers.find(o => o._id === offerId);
        setSelectedOffer(acceptedOffer);
      }

    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update offer.");
    }
  };

  if (loading) return <p style={{ padding: "2rem" }}>Loading offers...</p>;

  return (
    <div className="offers-page">

      {/* ── Header: title left, back button right ── */}
      <div className="offers-page-header">
        <div className="offers-page-header-text">
          <h2 className="offers-title">Offers Received</h2>
        </div>
        <button
          className="offers-back-button"
          onClick={() => navigate("/sellmyharvest")}
        >
          🏠 Back to Sell page
        </button>
      </div>

      <p className="offers-subtitle">
        Review and respond to trader offers for your crops.
      </p>

      {error && <p style={{ color: "red", marginBottom: "16px" }}>{error}</p>}

      {/* Stats row */}
      {offers.length > 0 && (
        <div className="offers-stats">
          <div className="offers-stat pending">
            <div className="offers-stat-num">
              {offers.filter(o => o.status === "Pending").length}
            </div>
            <div className="offers-stat-label">Pending</div>
          </div>
          <div className="offers-stat accepted">
            <div className="offers-stat-num">
              {offers.filter(o => o.status === "Accepted").length}
            </div>
            <div className="offers-stat-label">Accepted</div>
          </div>
          <div className="offers-stat rejected">
            <div className="offers-stat-num">
              {offers.filter(o => o.status === "Rejected").length}
            </div>
            <div className="offers-stat-label">Rejected</div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {offers.length === 0 ? (
        <div className="offers-empty">
          <div className="offers-empty-icon">📭</div>
          <h3>No offers yet</h3>
          <p>Traders will send offers when they are interested in your crops.</p>
        </div>
      ) : (
        <div>
          {offers.map((offer) => (
            <div className={`offer-card ${offer.status}`} key={offer._id}>
              <div className="offer-card-inner">

                <div className="offer-crop-icon">🌾</div>

                <div className="offer-card-body">
                  <h3 className="offer-crop-name">{offer.cropName}</h3>

                  <div className="offer-meta">
                    <div className="offer-meta-chip">
                      👤 <b>{offer.traderName}</b>
                    </div>
                    <div className="offer-meta-chip">
                      💰 <b>₹{offer.offerPrice}/kg</b>
                    </div>
                    <div className="offer-meta-chip">
                      📦 <b>{offer.quantity} KG</b>
                    </div>
                  </div>

                  {offer.message && (
                    <p className="offer-message">"{offer.message}"</p>
                  )}

                  {/* Actions moved inside body so nothing gets cut off */}
                  <div className="offer-card-actions">
                    <span className={`status ${offer.status}`}>
                      {offer.status}
                    </span>

                    {offer.status === "Pending" && (
                      <div className="offer-buttons">
                        <button
                          className="accept-btn"
                          onClick={() => updateStatus(offer._id, "Accepted")}
                        >
                          ✓ Accept
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => updateStatus(offer._id, "Rejected")}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accepted offer popup */}
      {selectedOffer && (
        <div className="popup-overlay">
          <div className="popup-card">

            <div className="popup-header">
              <div className="popup-header-icon">🤝</div>
              <h3>Offer Accepted!</h3>
              <p>Here are the trader's contact details</p>
            </div>

            <div className="popup-body">
              <div className="popup-row">
                <span className="popup-row-label">Trader Name</span>
                <span className="popup-row-value">{selectedOffer.traderName}</span>
              </div>
              <div className="popup-row">
                <span className="popup-row-label">Trader ID</span>
                <span className="popup-row-value">{selectedOffer.traderCode || "—"}</span>
              </div>
              <div className="popup-row">
                <span className="popup-row-label">Mobile</span>
                <span className="popup-row-value">{selectedOffer.traderMobile}</span>
              </div>
              <div className="popup-row">
                <span className="popup-row-label">Email</span>
                <span className="popup-row-value">{selectedOffer.traderEmail || "Not added"}</span>
              </div>
              <div className="popup-row">
                <span className="popup-row-label">Address</span>
                <span className="popup-row-value">{selectedOffer.traderAddress || "Not added"}</span>
              </div>
              <div className="popup-row">
                <span className="popup-row-label">Crop</span>
                <span className="popup-row-value">{selectedOffer.cropName}</span>
              </div>
              <div className="popup-row">
                <span className="popup-row-label">Agreed Price</span>
                <span className="popup-row-value" style={{ color: "#2e7d32" }}>
                  ₹{selectedOffer.offerPrice}/kg
                </span>
              </div>
              <div className="popup-row">
                <span className="popup-row-label">Quantity</span>
                <span className="popup-row-value">{selectedOffer.quantity} KG</span>
              </div>
            </div>

            <button className="close-btn" onClick={() => setSelectedOffer(null)}>
              Done
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

export default OffersReceived;
