import { Router } from "express";
import mongoose from "mongoose";
import { Offer } from "../models/Offer.js";
import { Crop } from "../models/Crop.js";
import { User } from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";
import { isRealMobile } from "../utils/userHelpers.js";
import { validate } from "../middleware/validate.js";
import { offerSchema, offerStatusSchema } from "../validators/schemas.js";

const router = Router();

// POST /api/offers — Trader submits an offer
// trader role required; crop, farmer and trader details come from the
// database. Only cropId, offerPrice, quantity and message are read from the request.
router.post("/", requireAuth, requireRole("trader"), validate(offerSchema), async (req, res, next) => {
  try {
    // already validated and converted to numbers by offerSchema
    const { cropId, offerPrice: price, quantity: qty, message } = req.body;

    const crop = await Crop.findById(cropId);
    if (!crop || crop.status !== "Active") {
      return res.status(404).json({ message: "This crop is no longer available" });
    }

    if (qty > crop.quantity) {
      return res.status(400).json({
        message: `Quantity cannot be more than the ${crop.quantity} KG available`
      });
    }

    const trader = await User.findById(req.user.id);
    if (!trader) {
      return res.status(404).json({ message: "User not found" });
    }

    // social accounts have no real mobile until they add and verify one
    if (!trader.name || !isRealMobile(trader.mobile) || !trader.address) {
      return res.status(400).json({
        message: "Your profile is incomplete. Please add your mobile number and address before making an offer."
      });
    }

    const offer = await Offer.create({
      traderId:      String(trader._id),
      traderName:    trader.name,
      traderMobile:  trader.mobile,
      traderEmail:   trader.email,
      traderAddress: trader.address,
      traderCode:    trader.userCode,
      cropId:        crop._id,
      cropName:      crop.name,
      farmerId:      crop.farmerId,
      farmerName:    crop.farmerName,
      offerPrice:    price,
      quantity:      qty,
      message
    });

    res.status(201).json({ message: "Offer submitted successfully", offer });

  } catch (err) {
    next(err);
  }
});

// GET /api/offers/farmer/:farmerId — Farmer sees all offers for their crops
// a farmer can only read offers made on their OWN crops
router.get("/farmer/:farmerId", requireAuth, requireRole("farmer"), async (req, res, next) => {
  try {
    if (req.params.farmerId !== req.user.userCode) {
      return res.status(403).json({ message: "You can only view your own offers" });
    }

    const offers = await Offer.find({
      farmerId: req.user.userCode
    }).sort({ createdAt: -1 });

    res.json({ offers });
  } catch (err) {
    next(err);
  }
});

// GET /api/offers/trader — Trader sees all their own offers
// once an offer is Accepted, the farmer's contact details are added
// (farmerContact) so the trader can complete the deal. Pending/Rejected offers
// never include them.
router.get("/trader", requireAuth, requireRole("trader"), async (req, res, next) => {
  try {
    const offers = await Offer.find({
      traderId: req.user.id
    }).sort({ createdAt: -1 }).lean();

    const acceptedFarmerCodes = [
      ...new Set(
        offers.filter((o) => o.status === "Accepted").map((o) => o.farmerId)
      )
    ];

    let contacts = {};
    if (acceptedFarmerCodes.length > 0) {
      const farmers = await User.find({ userCode: { $in: acceptedFarmerCodes } })
        .select("userCode mobile address profile.village");

      contacts = Object.fromEntries(
        farmers.map((f) => [
          f.userCode,
          {
            mobile: f.mobile,
            address: f.address || "",
            village: f.profile?.village || ""
          }
        ])
      );
    }

    res.json({
      offers: offers.map((o) =>
        o.status === "Accepted"
          ? { ...o, farmerContact: contacts[o.farmerId] || null }
          : o
      )
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/offers/:id — Farmer accepts or rejects
router.patch("/:id", requireAuth, requireRole("farmer"), validate(offerStatusSchema), async (req, res, next) => {
  try {
    const { status } = req.body;

    // bad ids return 400 instead of a 500 crash
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid offer id" });
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
