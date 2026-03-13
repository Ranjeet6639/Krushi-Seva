import "./FarmerDashboard.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import whatToGrow from "../assets/what-to-grow.jpg";
import sickCrops from "../assets/sick-crops.jpg";
import sellHarvest from "../assets/sell-harvest.jpg";

function FarmerDashboard() {

 const navigate = useNavigate();
 const [showAccount, setShowAccount] = useState(false);
 const [slide, setSlide] = useState(0);

 const [mobile, setMobile] = useState("9876543210");
 const [email, setEmail] = useState("farmer@email.com");

 const [editMobile, setEditMobile] = useState(false);
 const [editEmail, setEditEmail] = useState(false);

 const [otp, setOtp] = useState("");
 const [showOtp, setShowOtp] = useState(false);

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
  }, []);

 const sendOtp = () => {
  const generatedOtp = "1234";
  alert("OTP sent successfully! Your OTP is: " + generatedOtp);
  setShowOtp(true);
};

const verifyOtp = () => {
  if (otp === "1234") {
    alert("Verified Successfully");
    setShowOtp(false);
    setEditMobile(false);
    setEditEmail(false);
  } else {
    alert("Invalid OTP");
  }
};


  return (
    <div className="dashboard">

      {/* HEADER */}

      <div className="dashboard-header">

        <div className="brand">
          🌱
          <div>
            <h2>Krushi Seva</h2>
            <p>Your Farm Assistant</p>
          </div>
        </div>


        <div className="account-section">

          <div className="account-info">
            <strong>Rajesh Kumar</strong>
            <span>Village: Shivpur</span>
          </div>

          <img
            className="avatar"
            src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png"
            onClick={() => setShowAccount(!showAccount)}
          />

         {showAccount && (
     <div className="account-popup">

       <p><b>Name:</b> Rajesh Kumar</p>
       <p><b>Village:</b> Shivpur</p>
       <p><b>Farmer Address:</b> Shivpur Village, Maharashtra</p>

      {/* MOBILE */}
     <div className="editable-field">
      <b>Mobile:</b>

      {editMobile ? (
        <>
          <input
            type="text"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
          <button onClick={sendOtp}>Send OTP</button>
        </>
      ) : (
        <>
          <span>{mobile}</span>
          <button onClick={() => setEditMobile(true)}>Edit</button>
        </>
      )}

     </div>

     {/* EMAIL */}

     <div className="editable-field">
      <b>Email:</b>

      {editEmail ? (
        <>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={sendOtp}>Send OTP</button>
        </>
      ) : (
        <>
          <span>{email}</span>
          <button onClick={() => setEditEmail(true)}>Edit</button>
        </>
      )}

     </div>

     {/* OTP INPUT */}

     {showOtp && (
      <div className="otp-box">
        <input
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <button onClick={verifyOtp}>Verify</button>
      </div>
     )}

     {/* LOGOUT */}

     <button
     className="logout-btn"
     onClick={() => navigate("/logout")}
    >
     Logout
    </button>

      </div>
    )}
        </div>

      </div>


      {/* ACTION CARDS */}

     <div className="action-cards">

     <div
      className="action-card"
      onClick={() => navigate("/what-to-grow")}
     >
     <img src={whatToGrow} className="card-icon"/>
     <h3>NEW:<br/>WHAT TO GROW?</h3>
     </div>

     <div
     className="action-card"
     onClick={() => navigate("/sick-crops")}
     >
     <img src={sickCrops} className="card-icon"/>
     <h3>CHECK<br/>SICK CROPS</h3>
     </div>

     <div
     className="action-card"
     onClick={() => navigate("/sell-harvest")}
     >
     <img src={sellHarvest} className="card-icon"/>
     <h3>SELL MY<br/>HARVEST</h3>
     </div>

     </div>


      {/* SMART ADVICE */}

      <div className="advice-card">

        <img src={advice[slide].img} />

        <div className="advice-text">

          <span className="badge">SMART ADVICE</span>

          <h2>{advice[slide].title}</h2>

          <p>{advice[slide].text}</p>

          <button className="later-btn">
            Maybe Later
          </button>

        </div>

      </div>


      {/* LISTINGS */}

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

          <h3>Trader Offers</h3>

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