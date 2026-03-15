import React, { useState } from "react";
import "./SickCrop.css";
import cameraIcon from "../assets/Camera.jpg";
import UploadCamera from "../assets/UploadPhoto.jpg";
import Helpline from "../assets/Helpline.jpg";

function SickCrop() {

  const [image, setImage] = useState(null);
  const [disease, setDisease] = useState("");
  const [solution, setSolution] = useState("");
  const [pesticide, setPesticide] = useState("");
  const [loading, setLoading] = useState(false);

  // upload photo
  const handleImageUpload = async (event) => {

    const file = event.target.files[0];
    if (!file) return;

    setImage(URL.createObjectURL(file));
    setLoading(true);
    setDisease("");

    const formData = new FormData();
    formData.append("image", file);

    try {

      const res = await fetch("http://localhost:5000/detect", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      setTimeout(() => {
        setDisease(data.disease);
        setSolution(data.solution);
        setPesticide(data.pesticide);
        setLoading(false);
      }, 1000);

    } 
    catch (error) {

     console.log("Backend error:", error);

     setTimeout(() => {
     setDisease("Detection Failed");
     setSolution("Please try again or check backend connection.");
     setPesticide("-");
     setLoading(false);
     }, 1000);
     
}
  };

  return (
    <div>

      {/* Header */}
      <header className="sick-header">

        <div className="sick-logo">
          🌱 <span>Krushi Seva</span>
        </div>

        <button className="lang-btn">
          🌐 English / हिन्दी
        </button>

      </header>

      {/* Page Container */}
      <div className="sick-page">

      {/* Upload Section */}
     <div className="upload-box">

     <h2>1. Upload Photo of Sick Leaf</h2>

      {/* Camera icon circle */}
     {!image && (
     <div className="camera-circle">
       <img src={cameraIcon} className="camera-icon" alt="camera" />
     </div>
     )}

     {/* Image preview */}
     {image && <img src={image} className="preview" alt="preview" />}

     {/* Upload button */}

     <label className="upload-btn">
     <img src={UploadCamera} className="upload-camera" alt="Upload Photo" />
     CHOOSE PHOTO
     <input
      type="file"
      accept="image/*"
      capture="environment"
      onChange={handleImageUpload}
     />
      </label>
      <br></br>
      <br></br>

      <p className="hint">Take a clear photo in bright sunlight</p>

     </div>

        {/* Loading */}
        {loading && (

          <div className="loading-box">
            <h3>🔍 Scanning Leaf...</h3>
            <p>AI is analyzing the crop disease</p>
          </div>

        )}

        {/* Disease Result */}
        {!loading && disease && (

          <div className="result-box">

            <h3>Disease Found</h3>
            <h1>{disease}</h1>

            <div className="buttons">

              <button
                className="fix-btn"
                onClick={() => alert(solution)}
              >
                How to Fix
              </button>

              <button
                className="pesticide-btn"
                onClick={() => alert(pesticide)}
              >
                Pesticide Name
              </button>

            </div>

          </div>

        )}

      {/* Help Section */}
      <div className="expert-help">

        <div className="help-left">
    
      <div className="help-icon">
     <img src={Helpline} alt="Helpline" className="helpline-icon" />
     </div>

     <div className="help-text">
      <p>EXPERT HELPLINE</p>
      <h2>1800-KRUSHI-SEVA</h2>
      </div>

     </div>

     <a href="tel:+918005787382" className="call-btn">
     CALL NOW
     </a>

      </div>
        </div>

    </div>
  );
}

export default SickCrop;