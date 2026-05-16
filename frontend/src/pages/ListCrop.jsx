import React, { useState } from "react";
import "./ListCrop.css";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

function ListCrop() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    price: "",
    category: "Vegetable",
    photo: null
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhoto = (e) => {
    setFormData({
      ...formData,
      photo: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {

  e.preventDefault();

  const currentUser = JSON.parse(
    localStorage.getItem("currentUser") || "null"
  );

  const formDataToSend = new FormData();

  formDataToSend.append(
    "farmerId",
    currentUser?.userCode || "FR-000000"
  );

  formDataToSend.append(
    "farmerName",
    currentUser?.name || "Farmer"
  );

  formDataToSend.append(
    "farmerMobile",
    currentUser?.mobile || ""
  );

  formDataToSend.append(
    "farmerAddress",
    currentUser?.address || ""
  );

  formDataToSend.append(
    "farmerVillage",
    currentUser?.profile?.village || ""
  );

  formDataToSend.append(
    "name",
    formData.name
  );

  formDataToSend.append(
    "quantity",
    formData.quantity
  );

  formDataToSend.append(
    "price",
    formData.price
  );

  formDataToSend.append(
    "category",
    formData.category
  );

  /* THIS IS THE IMPORTANT PART */
  if (formData.photo) {

    formDataToSend.append(
      "image",
      formData.photo
    );

  }

  try {

  const response = await api.post("/crops", formDataToSend, {
  headers: {
    "Content-Type": "multipart/form-data"
  }
});

  console.log(response.data);

  alert("Crop Listed Successfully!");

  navigate("/sellmyharvest");

 } catch (err) {

  console.error(err);

  alert(
    err?.response?.data?.message ||
    "Failed to list crop. Please try again."
  );

 }

 };

  return (
    <div className="list-container">
      <div className="list-header">
        <div className="logo">Krushi Seva</div>
        <div className="menu">☰</div>
      </div>

      <div className="page-title">
        <h1>List New Crop</h1>
        <p>Provide details about the crop you're selling</p>
      </div>

      <form className="crop-form" onSubmit={handleSubmit}>
        <label>Crop Name</label>
        <input
          type="text"
          name="name"
          placeholder="E.g. Fresh Tomatoes"
          onChange={handleChange}
          required
        />

        <label>Quantity (KG)</label>
        <input
          type="number"
          name="quantity"
          placeholder="Enter total quantity in kilograms"
          onChange={handleChange}
          required
        />

        <label>Expected Price (Rs per kg)</label>
        <input
          type="number"
          name="price"
          placeholder="Enter price per kilogram"
          onChange={handleChange}
          required
        />

        <label>Category</label>
        <select name="category" onChange={handleChange}>
          <option>Vegetable</option>
          <option>Fruit</option>
          <option>Grains</option>
          <option>Pulses</option>
        </select>

        <div className="upload-box">
          <input type="file" onChange={handlePhoto} />
          <p>Drag & drop or click here to upload photo</p>
          <span>PNG, JPG up to 5MB</span>
        </div>

        <button type="submit" className="submit-btn">
          LIST CROP FOR SALE
        </button>
      </form>
    </div>
  );
}

export default ListCrop;
