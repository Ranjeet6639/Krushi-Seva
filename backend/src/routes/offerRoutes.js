import { Router } from "express";
import mongoose from "mongoose";
import { Offer } from "../models/Offer.js";
import { Crop } from "../models/Crop.js";
import { User } from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";
import { isRealMobile } from "../utils/userHelpers.js";
import { buildPagination, parsePagination } from "../utils/pagination.js";
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

    // pagination (a farmer's own list is small, so the default is large)
    const paging = parsePagination(req.query, { defaultLimit: 100, maxLimit: 200 });
    const filter = { farmerId: req.user.userCode };

    const [offers, total] = await Promise.all([
      Offer.find(filter).sort({ createdAt: -1, _id: -1 }).skip(paging.skip).limit(paging.limit),
      Offer.countDocuments(filter)
    ]);

    res.json({ offers, pagination: buildPagination(paging, total) });
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
    // pagination
    const paging = parsePagination(req.query, { defaultLimit: 100, maxLimit: 200 });
    const filter = { traderId: req.user.id };

    const [offers, total] = await Promise.all([
      Offer.find(filter).sort({ createdAt: -1, _id: -1 }).skip(paging.skip).limit(paging.limit).lean(),
      Offer.countDocuments(filter)
    ]);

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
      ),
      pagination: buildPagination(paging, total)
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

    /*
      (#11): an offer is answered ONCE.
      Before, an accepted offer could later be rejected (and the other way round),
      several offers could be accepted for the same crop, and the crop never
      changed. Now: Pending -> Accepted or Rejected, and that is final.
    */
    if (offer.status !== "Pending") {
      return res.status(409).json({
        message: `This offer was already ${offer.status.toLowerCase()} and can't be changed.`
      });
    }

    // "Pending -> new status" is done in ONE database step, so two quick clicks
    // (or two devices) can't both succeed.
    const claimed = await Offer.findOneAndUpdate(
      { _id: offer._id, status: "Pending" },
      { status },
      { new: true }
    );

    if (!claimed) {
      return res.status(409).json({ message: "This offer has just been answered already." });
    }

    if (status === "Rejected") {
      return res.json({ message: "Offer Rejected", offer: claimed });
    }

    // Accepted: take the quantity out of the crop (only if that much is still there)
    const crop = await Crop.findOneAndUpdate(
      {
        _id: offer.cropId,
        farmerId: offer.farmerId,
        status: "Active",
        quantity: { $gte: offer.quantity }
      },
      { $inc: { quantity: -offer.quantity } },
      { new: true }
    );

    if (!crop) {
      // undo the acceptance: nothing was sold
      await Offer.updateOne({ _id: offer._id, status: "Accepted" }, { status: "Pending" });
      return res.status(409).json({
        message: "This crop is no longer available in the quantity offered, so the offer can't be accepted."
      });
    }

    // Everything sold: close the listing and reject the offers that can no longer be met
    let soldOut = false;
    if (crop.quantity < 0.001) {
      crop.quantity = 0;
      crop.status = "Sold";
      await crop.save();
      await Offer.updateMany({ cropId: crop._id, status: "Pending" }, { status: "Rejected" });
      soldOut = true;
    }

    return res.json({
      message: "Offer Accepted",
      offer: claimed,
      cropQuantityLeft: crop.quantity,
      soldOut
    });
  } catch (err) {
    next(err);
  }
});

export default router;
