import { Router } from "express";
import { Offer } from "../models/Offer.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

// POST /api/offers — Trader submits an offer
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const {
      cropId, cropName, farmerId, farmerName,
      offerPrice, quantity, message,
      traderName, traderMobile, traderEmail,
      traderAddress, traderCode
    } = req.body;

    // Validate all required fields
    if (!cropId || !cropName || !farmerId || !offerPrice || !quantity) {
      return res.status(400).json({ message: "All offer details are required" });
    }

    if (!traderName || !traderMobile) {
      return res.status(400).json({
        message: "Your profile is incomplete. Please add your mobile number and address before making an offer."
      });
    }

    const offer = await Offer.create({
      traderId:     req.user.id,
      traderName,
      traderMobile,
      traderEmail,
      traderAddress,
      traderCode:   req.user.userCode,
      cropId,
      cropName,
      farmerId,
      farmerName,
      offerPrice,
      quantity,
      message
    });

    res.status(201).json({ message: "Offer submitted successfully", offer });

  } catch (err) {
    next(err);
  }
});

// GET /api/offers/farmer/:farmerId — Farmer sees all offers for their crops
router.get("/farmer/:farmerId", requireAuth, async (req, res, next) => {
  try {
    const offers = await Offer.find({
      farmerId: req.params.farmerId
    }).sort({ createdAt: -1 });

    res.json({ offers });
  } catch (err) {
    next(err);
  }
});

// GET /api/offers/trader — Trader sees all their own offers
router.get("/trader", requireAuth, async (req, res, next) => {
  try {
    const offers = await Offer.find({
      traderId: req.user.id
    }).sort({ createdAt: -1 });

    res.json({ offers });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/offers/:id — Farmer accepts or rejects
router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!["Accepted", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be Accepted or Rejected" });
    }

    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    // Only the farmer who owns the crop can update the offer
    if (offer.farmerId !== req.user.userCode) {
      return res.status(403).json({ message: "Not authorized" });
    }

    offer.status = status;
    await offer.save();

    res.json({ message: `Offer ${status}`, offer });
  } catch (err) {
    next(err);
  }
});

export default router;