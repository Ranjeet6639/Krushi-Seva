import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import "./EditProfile.css";

function EditProfile() {
  const navigate = useNavigate();
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [role, setRole]       = useState("farmer");

  // OTP states — same pattern as Register.jsx
  const [otpSent, setOtpSent]         = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp]                 = useState("");
  const [otpLoading, setOtpLoading]   = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [otpStatus, setOtpStatus]     = useState("");

  // Track original mobile to know if user changed it
  const [originalMobile, setOriginalMobile] = useState("");

  const [form, setForm] = useState({
    name:     "",
    gender:   "",
    dob:      "",
    mobile:   "",
    state:    "",
    district: "",
    address:  "",
    pincode:  "",
    village:  "",
    taluka:   "",
    ration:   ""
  });

  // Pre-fill form from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!user) return navigate("/login");

    setRole(user.role || "farmer");
    const mobile = user.mobile || "";
    setOriginalMobile(mobile);

    setForm({
      name:     user.name             || "",
      gender:   user.gender           || "",
      dob:      user.dob              || "",
      mobile,
      state:    user.state            || "",
      district: user.district         || "",
      address:  user.address          || "",
      pincode:  user.pincode          || "",
      village:  user.profile?.village || "",
      taluka:   user.profile?.taluka  || "",
      ration:   user.profile?.ration  || ""
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // If mobile number changes — reset OTP verification
    if (name === "mobile") {
      setOtpSent(false);
      setOtpVerified(false);
      setOtp("");
      setOtpStatus("");
    }
  };

  // Check if mobile was changed from original
  const mobileChanged = form.mobile !== originalMobile;
  // Mobile needs verification only if it was changed and is non-empty
  const needsMobileVerification = mobileChanged && form.mobile.length >= 10;

  // --- Send OTP (reuses /auth/otp/send exactly like Register.jsx) ---
  const sendOTP = async () => {
    if (!form.mobile || form.mobile.length < 10) {
      setError("Enter a valid 10-digit mobile number first.");
      return;
    }

    setError("");
    setOtpStatus("");
    setOtpLoading(true);

    try {
      const response = await api.post("/auth/otp/send", {
        mobile: form.mobile,
        role
      });

      setOtpSent(true);
      setOtpVerified(false);
      setOtpStatus(
        response.data.devOtp
          ? `OTP sent! Demo OTP: ${response.data.devOtp}`
          : "OTP sent successfully to your mobile."
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send OTP. Try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // --- Verify OTP (reuses /auth/otp/verify exactly like Register.jsx) ---
  const verifyOTP = async () => {
    if (!otp) {
      setError("Enter the OTP first.");
      return;
    }

    setError("");
    setOtpStatus("");
    setVerifyLoading(true);

    try {
      const response = await api.post("/auth/otp/verify", {
        mobile: form.mobile,
        role,
        otp
      });

      setOtpVerified(true);
      setOtpStatus("✓ Mobile number verified successfully!");
    } catch (err) {
      setOtpVerified(false);
      setError(err?.response?.data?.message || "OTP verification failed.");
    } finally {
      setVerifyLoading(false);
    }
  };

  // --- Save profile ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

     if (!form.name) {
     setError("Full name is required.");
     return;
     }
     if (!form.gender) {
     setError("Gender is required.");
     return;
     }
     if (!form.dob) {
     setError("Date of birth is required.");
     return;
     }
     if (!form.mobile || form.mobile.length < 10) {
     setError("Valid 10-digit mobile number is required.");
     return;
     }
     if (!form.state) {
     setError("State is required.");
     return;
     }
     if (!form.district) {
     setError("District is required.");
     return;
     }
     if (!form.address) {
     setError("Full address is required.");
     return;
     }
      if (!form.pincode || form.pincode.length < 6) {
      setError("Valid 6-digit pincode is required.");
      return;
     }
      if (role === "farmer") {
      if (!form.village) {
      setError("Village is required.");
      return;
     }
     if (!form.taluka) {
     setError("Taluka is required.");
     return;
     }
     }

    // If mobile was changed — must verify OTP first
    if (needsMobileVerification && !otpVerified) {
      setError("Mobile number changed. Please verify it with OTP before saving.");
      return;
    }

    setSaving(true);

    try {
      const response = await api.patch("/user/profile", form);

      // Update localStorage with fresh complete data
      localStorage.setItem("currentUser", JSON.stringify(response.data.user));
      setOriginalMobile(form.mobile);
      setSuccess("Profile updated successfully!");

      setTimeout(() => {
        if (role === "farmer") navigate("/farmerdashboard");
        else navigate("/Trader/TraderDashboard");
      }, 1500);

    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (role === "farmer") navigate("/farmerdashboard");
    else navigate("/Trader/TraderDashboard");
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-header">
        <button className="back-button" onClick={handleBack}>← Back</button>
        <h1>Edit Profile</h1>
      </div>

      <form className="edit-profile-form" onSubmit={handleSubmit}>

        {error   && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        {/* ── Personal Info ── */}
        <div className="form-section">
          <h3>Personal Info</h3>

          <label>Full Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your full name"
            required
          />

          <label>Gender *</label>
          <select name="gender" value={form.gender} onChange={handleChange} required>
            <option value="">Select gender *</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <label>Date of Birth *</label>
          <input
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleChange}
          />

          {/* ── Mobile with OTP verification ── */}
          <label>
            Mobile Number *
            {otpVerified && (
              <span style={{
                color: "#2e7d32",
                fontSize: "12px",
                marginLeft: "8px",
                fontWeight: "500"
              }}>
                ✓ Verified
              </span>
            )}
          </label>

          <div className="otp-row">
            <input
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              maxLength={10}
              style={{
                borderColor: otpVerified
                  ? "#2e7d32"
                  : mobileChanged && !otpVerified
                    ? "#f57c00"
                    : undefined
              }}
            />

            {/* Show Send OTP button only when mobile changed and not yet verified */}
            {needsMobileVerification && !otpVerified && (
              <button
                type="button"
                className="otp-btn"
                onClick={sendOTP}
                disabled={otpLoading}
              >
                {otpLoading ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
              </button>
            )}
          </div>

          {/* OTP input row — shown after OTP is sent */}
          {otpSent && !otpVerified && (
            <div className="otp-row" style={{ marginTop: "8px" }}>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                maxLength={6}
                className="otp-input"
              />
              <button
                type="button"
                className="otp-btn otp-verify-btn"
                onClick={verifyOTP}
                disabled={verifyLoading}
              >
                {verifyLoading ? "Verifying..." : "Verify"}
              </button>
            </div>
          )}

          {/* OTP status message */}
          {otpStatus && (
            <p style={{
              fontSize: "13px",
              color: otpVerified ? "#2e7d32" : "#f57c00",
              marginTop: "6px"
            }}>
              {otpStatus}
            </p>
          )}

          {/* Warning when mobile is changed but not yet verified */}
          {needsMobileVerification && !otpVerified && !otpSent && (
            <p style={{
              fontSize: "12px",
              color: "#f57c00",
              marginTop: "4px"
            }}>
              Mobile number changed — OTP verification required to save.
            </p>
          )}
        </div>

        {/* ── Location Info ── */}
        <div className="form-section">
          <h3>Location Info</h3>

          <label>State *</label>
          <input
            name="state"
            value={form.state}
            onChange={handleChange}
            placeholder="E.g. Maharashtra"
            required
          />

          <label>District *</label>
          <input
            name="district"
            value={form.district}
            onChange={handleChange}
            placeholder="E.g. Pune"
            required
          />

          <label>Full Address *</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="House/flat, street, area"
            rows={3}
            required
          />

          <label>Pincode *</label>
          <input
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
            placeholder="6-digit pincode"
            maxLength={6}
            required
          />
        </div>

        {/* ── Farmer-only Farm Info ── */}
        {role === "farmer" && (
          <div className="form-section">
            <h3>Farm Info</h3>

            <label>Village *</label>
            <input
              name="village"
              value={form.village}
              onChange={handleChange}
              placeholder="Your village name"
            />

            <label>Taluka *</label>
            <input
              name="taluka"
              value={form.taluka}
              onChange={handleChange}
              placeholder="Your taluka"
            />

            <label>Ration Card Number </label>
           <input
           name="ration"
           value={form.ration}
           onChange={handleChange}
           placeholder="Enter ration card number"
           />
       </div>
        )}

        <button type="submit" className="save-btn" disabled={saving}>
          {saving ? "Saving..." : "Save Profile"}
        </button>

      </form>
    </div>
  );
}

export default EditProfile;