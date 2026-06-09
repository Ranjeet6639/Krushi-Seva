# 🌱 Krushi Seva — Digital AgriTech Platform

> Connecting farmers and traders with AI-powered crop intelligence.

**Krushi Seva** is a full-stack MERN web application built for Indian farmers and agricultural traders. It provides role-based dashboards, a crop marketplace, AI-powered crop disease detection, and smart crop recommendation — all in a simple, mobile-friendly interface accessible in English and Hindi.

---

## 🚀 Live Demo

| Service  | URL |
|----------|-----|
| Frontend | [krushi-seva.vercel.app](https://krushi-seva.vercel.app) *(replace with your Vercel URL)* |
| Backend  | [krushi-seva-api.onrender.com](https://krushi-seva-api.onrender.com) *(replace with your Render URL)* |

---

## ✨ Features

### 👨‍🌾 For Farmers
- Register / Login with email + OTP verification
- Social login via Google, Apple, and Microsoft (Firebase Auth)
- Farmer dashboard with quick access to all tools
- **List crops for sale** with photos uploaded to Cloudinary
- **View offers** received from traders with accept/reject controls
- **Sick Crop Detector** — upload a leaf photo and get instant AI diagnosis (disease name, confidence, solution, pesticide recommendation)
- **What to Grow** — AI crop recommendation based on location, season, soil type, irrigation, and budget
- Edit profile

### 🚚 For Traders
- Separate trader registration and login flow
- Trader dashboard to browse available crop listings
- Make price offers directly to farmers
- Manage sent offers (pending / accepted / rejected)
- Trader profile management

### 🤖 AI Features (via OpenRouter)
| Feature | Model Used |
|---------|-----------|
| Crop Disease Detection | `nvidia/nemotron-nano-12b-v2-vl:free` (vision) |
| Crop Recommendation | `google/gemma-4-31b-it:free` |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, React Router v7, Axios, Lucide React |
| Backend | Node.js, Express 5, MongoDB Atlas, Mongoose |
| Auth | JWT, bcryptjs, Firebase Admin SDK (social login) |
| AI | OpenRouter API (vision + text models) |
| File Uploads | Multer (memory storage) + Cloudinary |
| Deployment | Vercel (frontend) · Render (backend) |

---

## 📁 Project Structure

```
Krushi-Seva/
├── frontend/                  # React + Vite app
│   ├── src/
│   │   ├── pages/
│   │   │   ├── FarmerDashboard.jsx
│   │   │   ├── SickCrop.jsx           # Disease detection
│   │   │   ├── WhatToGrow.jsx         # Crop recommendation
│   │   │   ├── SellMyHarvest.jsx
│   │   │   ├── ListCrop.jsx
│   │   │   ├── OffersReceived.jsx
│   │   │   └── Trader/
│   │   │       ├── TraderDashboard.jsx
│   │   │       ├── BuyCrops.jsx
│   │   │       └── TraderOffers.jsx
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── SocialLogin.jsx
│   │   └── lib/
│   │       ├── api.js                 # Axios instance
│   │       └── firebase.js
│   └── vercel.json
│
└── backend/                   # Express REST API
    └── src/
        ├── config/
        │   ├── db.js
        │   ├── cloudinary.js
        │   └── firebaseAdmin.js
        ├── controllers/
        │   ├── authController.js
        │   └── cropController.js
        ├── models/
        │   ├── User.js
        │   ├── Crop.js
        │   ├── Offer.js
        │   └── OtpVerification.js
        ├── routes/
        │   ├── authRoutes.js
        │   ├── cropRoutes.js
        │   ├── detectRoutes.js        # AI disease detection
        │   ├── recommendRoutes.js     # AI crop recommendation
        │   ├── offerRoutes.js
        │   └── userRoutes.js
        └── server.js
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account
- Firebase project (for social login)
- OpenRouter API key (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/krushi-seva.git
cd krushi-seva
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in your `.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret
OPENROUTER_API_KEY=your_openrouter_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
NODE_ENV=development
```

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd frontend
npm install
cp src/.env.example src/.env
```

Fill in your Firebase config in `src/.env`, then:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:5000`.

---

## 🌐 Deployment

**Frontend → Vercel**
```bash
cd frontend
npm run build
# Push to GitHub and connect repo to Vercel
```
Add `VITE_API_URL=https://your-render-url.onrender.com` as an environment variable in Vercel.

**Backend → Render**
- Create a new Web Service on Render, connect your GitHub repo
- Set root directory to `backend`
- Start command: `node src/server.js`
- Add all `.env` variables in Render's environment settings

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Farmer registration |
| POST | `/api/auth/login` | Farmer login |
| POST | `/api/social-auth` | Google/Apple/Microsoft login |
| GET | `/api/crops` | List all crops |
| POST | `/api/crops` | Add a crop listing |
| POST | `/api/detect` | AI crop disease detection (image upload) |
| POST | `/api/recommend` | AI crop recommendation |
| GET | `/api/offers` | Get offers for a farmer |
| POST | `/api/offers` | Place an offer (trader) |

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## 👨‍💻 Developer

**Ranjeet** — Full Stack Developer  
B.Tech Computer Science, Pimpri Chinchwad University, Pune  
[GitHub](https://github.com/Ranjeet6639) · [LinkedIn](https://www.linkedin.com/in/ranjeet-shinde-411244288/)
