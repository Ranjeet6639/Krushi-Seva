import React, { useState } from "react";
import "./ListCrop.css";
import { useNavigate } from "react-router-dom";

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

  const handleSubmit = (e) => {
    e.preventDefault();

    const existingCrops = JSON.parse(localStorage.getItem("crops")) || [];
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

    const newCrop = {
      id: Date.now(),
      name: formData.name,
      quantity: formData.quantity,
      price: formData.price,
      category: formData.category,
      status: "Active",
      image: formData.photo
        ? URL.createObjectURL(formData.photo)
        : "https://images.unsplash.com/photo-1587049352851-8d4e89133924",
      farmerName: currentUser?.name || "Farmer",
      farmerMobile: currentUser?.mobile || "Not added",
      farmerAddress: currentUser?.address || "Address not added",
      farmerVillage: currentUser?.profile?.village || "Village not added",
      farmerId: currentUser?.userCode || "FR-000000"
    };

    existingCrops.push(newCrop);
    localStorage.setItem("crops", JSON.stringify(existingCrops));

    alert("Crop Listed Successfully!");
    navigate("/sellmyharvest");
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
