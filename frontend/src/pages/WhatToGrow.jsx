import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./WhatToGrow.css";
import { Sprout, Leaf, Droplets, Home } from "lucide-react";
import api from "../lib/api";

export default function WhatToGrow() {

  const [formData, setFormData] = useState({
    location: "",
    season: "",
    soil: "",
    irrigation: "",
    water: "",
    previousCrop: "",
    preference: "",
    budget: "",
  });

  const [errors, setErrors] = useState({}); // ✅ NEW
  const [result, setResult] = useState("");
  const [showAI, setShowAI] = useState(false);
  const [loading, setLoading] = useState(false);
  const [navLoading, setNavLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // ✅ remove error when user types
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleAnalyze = async () => {

    // ✅ VALIDATION
    let newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (!formData[key]) {
        newErrors[key] = "Required";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
   }

    setLoading(true);

   try {
   const startTime = Date.now();

   const response = await api.post("/recommend", { formData });  // ← uses api.js, correct path

   const elapsed = Date.now() - startTime;
   if (elapsed < 500) {
    await new Promise((res) => setTimeout(res, 500 - elapsed));
 }

   setResult(response.data.result);

  } catch (error) {
   console.error(error);
   setResult("Error getting recommendation. Please try again.");
 }

    setLoading(false);
  };

   const handleBack = async () => {
    setNavLoading(true);
    await new Promise((res) => setTimeout(res, 1000));
    navigate("/farmerDashboard");
  };

  return (
    <div className="grow-container">

      <header className="grow-header">
        <div className="logo">
          🌱 <span>Krushi Seva</span>
        </div>

        <button className="lang-btn">
          🌐 English / हिन्दी
        </button>
      </header>

      <div className="grow-title">
        <span className="tag">WHAT TO GROW</span>

        <h1>
          Growing Millets <span>Step-by-Step</span>
        </h1>

        <p>
          Follow these simple steps for a healthy and high-yield millet crop.
        </p>
      </div>

      <div className="steps">

        <div className="step-card">
          <div className="icon"><Sprout size={28} /></div>
          <div className="text">
            <h3>Step 1: Prepare Soil</h3>
            <p>Plough the field twice to make the soil loose.Add natural or compost for better growth.</p>
          </div>
          <div className="number">1</div>
        </div>

        <div className="step-card">
          <div className="icon"><Leaf size={28} /></div>
          <div className="text">
            <h3>Step 2: Sowing</h3>
            <p>Plant seeds 2-3cm deep in the ground.Keep a distance of 10cm between each plant.</p>
          </div>
          <div className="number">2</div>
        </div>

        <div className="step-card">
          <div className="icon"><Droplets size={28} /></div>
          <div className="text">
            <h3>Step 3: Watering</h3>
            <p>Water the field immediately after sowing.After that,water only when the soil feels very dry.</p>
          </div>
          <div className="number">3</div>
        </div>

      </div>

      <div className="ai-toggle">
        <button onClick={() => setShowAI(!showAI)} className="ai-open-btn">
          🌱 AI Crop Recommendation
        </button>
      </div>

      {showAI && (
        <div className="ai-section">
          <h2>🌱 Get AI Crop Recommendation</h2>

          <div className="form-grid">

            <div>
              <input name="location" placeholder="Location" onChange={handleChange} />
              {errors.location && <small className="error-text">{errors.location}</small>}
            </div>

            <div>
              <select name="season" onChange={handleChange}>
                <option value="">Season</option>
                <option>Kharif</option>
                <option>Rabi</option>
                <option>Summer</option>
              </select>
              {errors.season && <small className="error-text">{errors.season}</small>}
            </div>

            <div>
              <select name="soil" onChange={handleChange}>
                <option value="">Soil Type</option>
                <option>Black</option>
                <option>Red</option>
                <option>Sandy</option>
                <option>Clay</option>
                <option>Loamy</option>
              </select>
              {errors.soil && <small className="error-text">{errors.soil}</small>}
            </div>

            <div>
              <select name="irrigation" onChange={handleChange}>
                <option value="">Irrigation</option>
                <option>Yes</option>
                <option>No</option>
              </select>
              {errors.irrigation && <small className="error-text">{errors.irrigation}</small>}
            </div>

            <div>
              <select name="water" onChange={handleChange}>
                <option value="">Water Level</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              {errors.water && <small className="error-text">{errors.water}</small>}
            </div>

            <div>
              <input name="previousCrop" placeholder="Previous Crop" onChange={handleChange} />
              {errors.previousCrop && <small className="error-text">{errors.previousCrop}</small>}
            </div>

            <div>
              <select name="preference" onChange={handleChange}>
                <option value="">Crop Preference</option>
                <option>Food</option>
                <option>Cash</option>
              </select>
              {errors.preference && <small className="error-text">{errors.preference}</small>}
            </div>

            <div>
              <select name="budget" onChange={handleChange}>
                <option value="">Budget</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              {errors.budget && <small className="error-text">{errors.budget}</small>}
            </div>

          </div>

          <button className="analyze-btn" onClick={handleAnalyze} disabled={loading}>
            {loading ? "⏳ Analyzing..." : "🔍 Analyze & Suggest Crop"}
          </button>

          {result && (
            <div className="result-box">
              <h3>🌾 Recommended Crops:</h3>
              <p>{result}</p>
            </div>
          )}
        </div>
      )}

      <button onClick={handleBack} className="back-btn" disabled={navLoading}>
        <Home size={20} />
        {navLoading ? "⏳ Loading..." : "Back to Home"}
      </button>

    </div>
  );
}