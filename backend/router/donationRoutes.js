import express from "express";
import {
  registerDonation,
  getDonationHistory,
  getDonationCenters,
  getTopDonors,
  addDonationCenter
} from "../controller/donationController.js";
import { isAdminAuthenticated, isPatientAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/donate", isPatientAuthenticated,registerDonation);
router.get("/history",isPatientAuthenticated, getDonationHistory);
router.get("/centers", getDonationCenters);
router.get("/top-donors", getTopDonors);
router.post("/newCentre",isAdminAuthenticated,addDonationCenter);

export default router;
