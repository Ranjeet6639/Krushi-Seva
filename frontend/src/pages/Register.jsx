import "./Register.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
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
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const nextValue = files ? files[0] : value;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: nextValue
    }));

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
        role: "farmer"
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
        role: "farmer",
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

  const handleSubmit = async (e) => {
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
    setStatus("");
    setLoading(true);

    try {
      await api.post("/auth/register", {
        role: "farmer",
        name: form.name,
        gender: form.gender,
        dob: form.dob,
        ration: form.ration,
        fileName: form.file?.name || "",
        state: form.state,
        district: form.district,
        taluka: form.taluka,
        village: form.village,
        pincode: form.pincode,
        address: form.address,
        mobile: form.mobile,
        email: form.email,
        password: form.password
      });

      navigate("/login", {
        state: { successMessage: "Farmer registered successfully. Please log in." }
      });
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
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
          <textarea
            name="address"
            placeholder="Farmer Address"
            className="textarea"
            onChange={handleChange}
          ></textarea>
        </fieldset>

        <fieldset className="form-section">
          <legend>Contact & Security</legend>

          <div className="otp-row">
            <input name="mobile" placeholder="Mobile Number" className="input" onChange={handleChange} />
            <button type="button" onClick={sendOTP} disabled={otpLoading}>
              {otpLoading ? "Sending..." : "Send OTP"}
            </button>
          </div>

          {otpSent && (
            <div className="otp-row">
              <input
                placeholder="Enter OTP"
                className="input"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button type="button" onClick={verifyOTP} disabled={verifyLoading}>
                {verifyLoading ? "Verifying..." : "Verify"}
              </button>
            </div>
          )}

          <input name="email" placeholder="Email Address" className="input" onChange={handleChange} />
          <input type="password" name="password" placeholder="Password" className="input" onChange={handleChange} />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="input"
            onChange={handleChange}
          />
        </fieldset>

        {status && <p className="success">{status}</p>}
        {error && <p className="error">{error}</p>}

        <button className="submit-btn" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

export default Register;
