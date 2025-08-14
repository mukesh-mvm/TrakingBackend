import express from "express";
import {
  createCompaign,
  getAllCompaigns,
  getCompaignById,
  updateCompaign,
  deleteCompaign,
} from "../controllers/compaignController.js";

const router = express.Router();

router.post("/creteCompaign", createCompaign);
router.get("/getALLCompaign", getAllCompaigns);
router.get("/getOneCompaign/:id", getCompaignById);
router.patch("/updateCompaign/:id", updateCompaign);
router.delete("/deleteCompaign/:id", deleteCompaign);

export default router;
