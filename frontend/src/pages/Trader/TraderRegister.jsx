import "./TraderRegister.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

function TraderRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
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
  const [otpVerified, setOtpVerified] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));

    if (name === "mobile") {
      setOtpSent(false);
      setOtpVerified(false);
      setOtp("");
      setStatus("");
    }
  };

  const sendOTP = async () => {
    if (!form.mobile) {
      setError("Enter mobile number first");
      return;
    }

    setError("");
    setStatus("");
    setOtpLoading(true);

    try {
      const response = await api.post("/auth/otp/send", {
        mobile: form.mobile,
        role: "trader"
      });

      setOtpSent(true);
      setOtpVerified(false);
      setStatus(
        response.data.devOtp
          ? `OTP sent successfully. Demo OTP: ${response.data.devOtp}`
          : "OTP sent successfully."
      );
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp) {
      setError("Enter OTP first");
      return;
    }

    setError("");
    setStatus("");
    setVerifyLoading(true);

    try {
      const response = await api.post("/auth/otp/verify", {
        mobile: form.mobile,
        role: "trader",
        otp
      });

      setOtpVerified(true);
      setStatus(response.data.message);
    } catch (apiError) {
      setOtpVerified(false);
      setError(apiError.response?.data?.message || "OTP verification failed");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleSubmit = async () => {
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
    setStatus("");
    setLoading(true);

    try {
      await api.post("/auth/register", {
        role: "trader",
        name: form.name,
        gender: form.gender,
        dob: form.dob,
        mobile: form.mobile,
        email: form.email,
        password: form.password,
        state: form.state,
        district: form.district,
        address: form.address,
        pincode: form.pincode
      });

      navigate("/Trader/TraderLogin", {
        state: { successMessage: "Trader registered successfully. Please log in." }
      });
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Trader Registration</h2>

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

      <div className="form-section">
        <h3>Address</h3>

        <input name="state" placeholder="State" onChange={handleChange} />
        <input name="district" placeholder="District" onChange={handleChange} />
        <textarea name="address" placeholder="Full Address" onChange={handleChange}></textarea>
        <input name="pincode" placeholder="Pincode" onChange={handleChange} />
      </div>

      <div className="form-section">
        <h3>Contact & Security</h3>

        <div className="otp-row">
          <input name="mobile" placeholder="Mobile Number" onChange={handleChange} />
          <button type="button" onClick={sendOTP} disabled={otpLoading}>
            {otpLoading ? "Sending..." : "Send OTP"}
          </button>
        </div>

        {otpSent && (
          <div className="otp-row">
            <input placeholder="Enter OTP" onChange={(e) => setOtp(e.target.value)} value={otp} />
            <button type="button" onClick={verifyOTP} disabled={verifyLoading}>
              {verifyLoading ? "Verifying..." : "Verify"}
            </button>
          </div>
        )}

        <input name="email" placeholder="Email" onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} />
        <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} />
      </div>

      {status && <p className="success">{status}</p>}
      {error && <p className="error">{error}</p>}

      <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </button>
    </div>
  );
}

export default TraderRegister;
