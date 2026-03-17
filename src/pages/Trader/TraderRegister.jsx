import "./TraderRegister.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function TraderRegister() {

  const navigate = useNavigate(); // ✅ added

  const [form, setForm] = useState({
    name: "",
    gender: "",
    dob: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
    state: "",
    district: "",
    address: "",
    pincode: ""
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false); // ✅ added
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Send OTP (fake)
  const sendOTP = () => {
    if (!form.mobile) {
      setError("Enter mobile number first");
      return;
    }
    setError("");
    setOtpSent(true);
    alert("OTP Sent (demo: 1234)");
  };

  // ✅ Verify OTP
  const verifyOTP = () => {
    if (otp === "1234") {
      setOtpVerified(true); // ✅ mark verified
      alert("OTP Verified ✅");
    } else {
      setOtpVerified(false);
      alert("Invalid OTP ❌");
    }
  };

   const handleSubmit = () => {

   if (!form.name || !form.email || !form.mobile || !form.password) {
    setError("Please fill required fields");
    return;
   }

   if (form.password !== form.confirmPassword) {
    setError("Passwords do not match");
    return;
   }

   if (!otpVerified) {
    setError("Please verify OTP first");
    return;
   }

   setError("");

   // ✅ SAVE PROFILE DATA (VERY IMPORTANT)
   const { password, confirmPassword, ...safeData } = form;
   localStorage.setItem("traderProfile", JSON.stringify(safeData)); 

   alert("Trader Registered Successfully ✅");

    // ✅ Redirect to login page
    setTimeout(() => {
    navigate("/Trader/TraderLogin");
    }, 1000);
   };

  return (
    <div className="register-container">

      <h2>Trader Registration</h2>

      {/* PERSONAL INFO */}
      <div className="form-section">
        <h3>Personal Information</h3>

        <input name="name" placeholder="Full Name" onChange={handleChange} />

        <select name="gender" onChange={handleChange}>
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
        </select>

        <input type="date" name="dob" onChange={handleChange} />
      </div>

      {/* ADDRESS */}
      <div className="form-section">
        <h3>Address</h3>

        <input name="state" placeholder="State" onChange={handleChange} />
        <input name="district" placeholder="District" onChange={handleChange} />
        <textarea name="address" placeholder="Full Address" onChange={handleChange}></textarea>
        <input name="pincode" placeholder="Pincode" onChange={handleChange} />
      </div>

      {/* CONTACT */}
      <div className="form-section">
        <h3>Contact & Security</h3>

        <div className="otp-row">
          <input
            name="mobile"
            placeholder="Mobile Number"
            onChange={handleChange}
          />
          <button onClick={sendOTP}>Send OTP</button>
        </div>

        {otpSent && (
          <div className="otp-row">
            <input
              placeholder="Enter OTP"
              onChange={(e) => setOtp(e.target.value)}
            />
            <button onClick={verifyOTP}>Verify</button>
          </div>
        )}

        <input name="email" placeholder="Email" onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} />
        <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} />
      </div>

      {error && <p className="error">{error}</p>}

      <button className="submit-btn" onClick={handleSubmit}>
        Register
      </button>

    </div>
  );
}

export default TraderRegister;