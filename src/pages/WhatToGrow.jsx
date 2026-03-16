import React from "react";
import { Link } from "react-router-dom";
import "./WhatToGrow.css";
import { Sprout, Leaf, Droplets, Home } from "lucide-react";

export default function WhatToGrow() {
  return (
    <div className="grow-container">

      <header className="grow-header">
        <div className="logo">
          🌱 <span>Krushi Seva</span>
        </div>

        <button className="lang-btn">
          🌐 English
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
          <div className="icon">
            <Sprout size={28} />
          </div>

          <div className="text">
            <h3>Step 1: Prepare Soil</h3>
            <p>
              Plough the field twice to make the soil loose.Add natural or compost for better growth.
            </p>
          </div>

          <div className="number">1</div>
        </div>

        <div className="step-card">
          <div className="icon">
            <Leaf size={28} />
          </div>

          <div className="text">
            <h3>Step 2: Sowing</h3>
            <p>
              Plant seeds 2-3cm deep in the ground.Keep a distance of 10cm between each plant.
            </p>
          </div>

          <div className="number">2</div>
        </div>

        <div className="step-card">
          <div className="icon">
            <Droplets size={28} />
          </div>

          <div className="text">
            <h3>Step 3: Watering</h3>
            <p>
              Water the field immediately after sowing.After that,water only when the soil feels very dry.
            </p>
          </div>

          <div className="number">3</div>
        </div>

      </div>

      <Link to="/FarmerDashboard" className="back-btn">
        <Home size={20} />
        Back to Home
      </Link>

    </div>
  );
}