import "./Register.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  // ✅ Form state
  const [form, setForm] = useState({
    name: "",
    gender: "",
    dob: "",
    ration: "",
    file: null,
    state: "",
    district: "",
    taluka: "",
    village: "",
    pincode: "",
    address: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [error, setError] = useState("");

  // ✅ Handle input
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: files ? files[0] : value
    });
  };

  const sendOTP = () => {
    if (!form.mobile) {
      setError("Enter mobile number first");
      return;
    }
    setError("");
    setOtpSent(true);
    alert("OTP Sent (demo: 1234)");
  };

  const verifyOTP = () => {
    if (otp === "1234") {
      setOtpVerified(true);
      alert("OTP Verified ✅");
    } else {
      setOtpVerified(false);
      alert("Invalid OTP ❌");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.mobile || !form.email || !form.password) {
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
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      alert("Farmer Registered Successfully ✅");

      navigate("/login");
    }, 800);
  };

  return (
    <div className="register-container">

      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}

      <h1 className="register-title">Farmer Registration</h1>

      <form onSubmit={handleSubmit}>

        {/* PERSONAL INFO */}
        <fieldset className="form-section">
          <legend>Personal Information</legend>

          <input name="name" placeholder="Full Name" className="input" onChange={handleChange} />

          <select name="gender" className="input" onChange={handleChange}>
            <option value="">Select Gender</option>
            <option>Male</option>
            <option>Female</option>
          </select>

          <input type="date" name="dob" className="input" onChange={handleChange} />

          <input name="ration" placeholder="Ration Card Number" className="input" onChange={handleChange} />

          <input type="file" name="file" className="input" onChange={handleChange} />
        </fieldset>

        {/* FARM LOCATION */}
        <fieldset className="form-section">
          <legend>Farm Location</legend>

          <select name="state" className="input" onChange={handleChange}>
            <option value="">Select State</option>
            <option>Maharashtra</option>
          </select>

          <input name="district" placeholder="District" className="input" onChange={handleChange} />
          <input name="taluka" placeholder="Taluka" className="input" onChange={handleChange} />
          <input name="village" placeholder="Village" className="input" onChange={handleChange} />
          <input name="pincode" placeholder="Pincode" className="input" onChange={handleChange} />

          <textarea name="address" placeholder="Farmer Address" className="textarea" onChange={handleChange}></textarea>
        </fieldset>

        {/* CONTACT */}
        <fieldset className="form-section">
          <legend>Contact & Security</legend>

          <div className="otp-row">
            <input
              name="mobile"
              placeholder="Mobile Number"
              className="input"
              onChange={handleChange}
            />
            <button type="button" onClick={sendOTP}>Send OTP</button>
          </div>

          {otpSent && (
            <div className="otp-row">
              <input
                placeholder="Enter OTP"
                className="input"
                onChange={(e) => setOtp(e.target.value)}
              />
              <button type="button" onClick={verifyOTP}>Verify</button>
            </div>
          )}

          <input name="email" placeholder="Email Address" className="input" onChange={handleChange} />
          <input type="password" name="password" placeholder="Password" className="input" onChange={handleChange} />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" className="input" onChange={handleChange} />
        </fieldset>

        {error && <p className="error">{error}</p>}

        <button className="submit-btn">
          Submit
        </button>

      </form>

    </div>
  );
}

export default Register;