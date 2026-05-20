import "./TraderProfile.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function TraderProfile() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) setProfile(JSON.parse(storedUser));
  }, []);

  if (!profile) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <p>No trader information found. Please log in again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Trader Profile</h2>
        <button
          className="edit-btn"
          onClick={() => navigate("/editprofile")}
        >
          ✏️ Edit Profile
        </button>
      </div>

      <div className="profile-card">
        <p><b>Name:</b> {profile.name}</p>
        <p><b>Gender:</b> {profile.gender || "Not added"}</p>
        <p><b>DOB:</b> {profile.dob || "Not added"}</p>
        <p><b>Mobile:</b> {profile.mobile || "Not added"}</p>
        <p><b>Email:</b> {profile.email || "Not added"}</p>
        <p><b>Address:</b> {profile.address || "Not added"}</p>
        <p><b>State:</b> {profile.state || "Not added"}</p>
        <p><b>District:</b> {profile.district || "Not added"}</p>
        <p><b>Pincode:</b> {profile.pincode || "Not added"}</p>
      </div>
    </div>
  );
}

export default TraderProfile;