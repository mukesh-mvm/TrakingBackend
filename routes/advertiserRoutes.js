import express from "express";
import {
  createAdvertiser,
  getAllAdvertisers,
  getAdvertiserById,
  updateAdvertiser,
  deleteAdvertiser,
} from "../controllers/advertiserController.js";

const router = express.Router();

// CRUD Routes
router.post("/create", createAdvertiser);
router.get("/getAll", getAllAdvertisers);
router.get("/getOne/:id", getAdvertiserById);
router.patch("/update/:id", updateAdvertiser);
router.delete("/delete/:id", deleteAdvertiser);

export default router;
