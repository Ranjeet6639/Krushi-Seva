import "./TraderProfile.css";
import { useEffect, useState } from "react";

function TraderProfile() {

  const [profile, setProfile] = useState({
    name: "",
    gender: "",
    dob: "",
    mobile: "",
    email: "",
    state: "",
    district: "",
    address: "",
    pincode: ""
  });

  const [editMobile, setEditMobile] = useState(false);
  const [editAddress, setEditAddress] = useState(false);

  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);

  // ✅ LOAD DATA
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("traderProfile"));

    if (stored) {
      setProfile(stored);
    } else {
      // default (for testing)
      const defaultData = {
        name: "Trader User",
        gender: "Male",
        dob: "2000-01-01",
        mobile: "9876543210",
        email: "trader@email.com",
        state: "Maharashtra",
        district: "Pune",
        address: "Shivaji Nagar",
        pincode: "411001"
      };

      setProfile(defaultData);
      localStorage.setItem("traderProfile", JSON.stringify(defaultData));
    }
  }, []);

  // ✅ SAVE FUNCTION
  const saveProfile = (updated) => {
    setProfile(updated);
    localStorage.setItem("traderProfile", JSON.stringify(updated));
  };

  // ✅ OTP SEND
  const sendOtp = () => {
    alert("OTP Sent: 1234");
    setShowOtp(true);
  };

  // ✅ OTP VERIFY
  const verifyOtp = () => {
    if (otp === "1234") {
      alert("Verified ✅");
      setShowOtp(false);
      setEditMobile(false);
      saveProfile(profile);
    } else {
      alert("Invalid OTP ❌");
    }
  };

  return (
    <div className="profile-container">

      <h2>Trader Profile</h2>

      <div className="profile-card">

        <p><b>Name:</b> {profile.name}</p>
        <p><b>Gender:</b> {profile.gender}</p>
        <p><b>DOB:</b> {profile.dob}</p>

        {/* MOBILE */}
        <div className="profile-field">
          <b>Mobile:</b>

          {editMobile ? (
            <>
              <input
                value={profile.mobile}
                onChange={(e) =>
                  setProfile({ ...profile, mobile: e.target.value })
                }
              />
              <button onClick={sendOtp}>Send OTP</button>
            </>
          ) : (
            <>
              <span>{profile.mobile}</span>
              <button onClick={() => setEditMobile(true)}>Edit</button>
            </>
          )}
        </div>

        {/* OTP */}
        {showOtp && (
          <div className="otp-box">
            <input
              placeholder="Enter OTP"
              onChange={(e) => setOtp(e.target.value)}
            />
            <button onClick={verifyOtp}>Verify</button>
          </div>
        )}

        <p><b>Email:</b> {profile.email}</p>

        {/* ADDRESS */}
        <div className="profile-field">
          <b>Address:</b>

          {editAddress ? (
            <>
              <input
                value={profile.address}
                onChange={(e) =>
                  setProfile({ ...profile, address: e.target.value })
                }
              />
              <button
                onClick={() => {
                  saveProfile(profile);
                  setEditAddress(false);
                }}
              >
                Save
              </button>
            </>
          ) : (
            <>
              <span>{profile.address}</span>
              <button onClick={() => setEditAddress(true)}>Edit</button>
            </>
          )}
        </div>

        <p><b>State:</b> {profile.state}</p>
        <p><b>District:</b> {profile.district}</p>
        <p><b>Pincode:</b> {profile.pincode}</p>

      </div>

    </div>
  );
}

export default TraderProfile;