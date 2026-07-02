import "./Login.css";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      setError("Please fill in both fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await api.post("/auth/reset-password", { token, password });

      navigate("/login", {
        state: { successMessage: "Password reset successful. Please log in." }
      });
    } catch (apiError) {
      setError(
        apiError.response?.data?.message ||
          "This reset link is invalid or has expired. Please request a new one."
      );
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
        <h1>Reset Password</h1>

        {error && <p className="error-text">{error}</p>}

        <input
          type="password"
          placeholder="New password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm new password"
          className="input-field"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button className="login-btn" onClick={handleSubmit}>
          Reset Password
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;
