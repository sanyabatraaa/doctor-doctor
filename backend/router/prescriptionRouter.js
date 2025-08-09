import express from "express";
import { createPrescription , getPrescriptionsToRemind } from "../controller/prescriptionController.js";
import { isDoctorAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/create-Prescription", isDoctorAuthenticated, createPrescription);
router.get("/reminders", getPrescriptionsToRemind);

export default router;