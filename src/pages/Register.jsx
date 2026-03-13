import "./Register.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      navigate("/login");
    }, 500);
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

        <input type="text" placeholder="Full Name" className="input"/>
        <select className="input">
          <option>Select Gender</option>
          <option>Male</option>
          <option>Female</option>
        </select>

        <input type="date" className="input"/>
        <input type="text" placeholder="Ration Card Number" className="input"/>
        <input type="file" className="input"/>

      </fieldset>

      <fieldset className="form-section">
        <legend>Farm Location</legend>

        <select className="input">
          <option>Select State</option>
          <option>Maharashtra</option>
        </select>

        <input type="text" placeholder="District" className="input"/>
        <input type="text" placeholder="Taluka" className="input"/>
        <input type="text" placeholder="Village" className="input"/>
        <input type="text" placeholder="Pincode" className="input"/>

        <textarea placeholder="Farmer Address" className="textarea"></textarea>

      </fieldset>

      <fieldset className="form-section">
        <legend>Contact & Security</legend>

        <input type="tel" placeholder="Mobile Number" className="input"/>
        <input type="email" placeholder="Email Address" className="input"/>
        <input type="password" placeholder="Password" className="input"/>
        <input type="password" placeholder="Confirm Password" className="input"/>

      </fieldset>

      <button className="submit-btn">
        Submit
      </button>

      </form>

    </div>
  );
}

export default Register;