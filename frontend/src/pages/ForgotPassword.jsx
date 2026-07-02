import "./Login.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Backend always returns a generic success message here,
      // whether or not the email is registered — that's intentional
      // so no one can use this form to find out who has an account.
      await api.post("/auth/forgot-password", { email, role: "farmer" });
      setSubmitted(true);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}

      <div className="login-card">
        <h1>Forgot Password</h1>

        {submitted ? (
          <>
            <p className="success-text">
              If an account exists for <strong>{email}</strong>, we've sent a
              password reset link to it. Please check your inbox (and spam folder).
            </p>
            <Link to="/login">
              <button className="login-btn">Back to Login</button>
            </Link>
          </>
        ) : (
          <>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Enter the email address linked to your account and we'll send you
              a link to reset your password.
            </p>

            {error && <p className="error-text">{error}</p>}

            <input
              type="email"
              placeholder="Email address"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button className="login-btn" onClick={handleSubmit}>
              Send Reset Link
            </button>

            <p style={{ marginTop: "16px", fontSize: "14px" }}>
              <Link to="/login">Back to Login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
