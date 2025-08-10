import express from "express";
import { createPrescription , getPrescriptionsToRemind , getPrescriptionByAppointment,updatePrescription} from "../controller/prescriptionController.js";
import { isDoctorAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/create-Prescription", isDoctorAuthenticated, createPrescription);
router.get("/reminders", getPrescriptionsToRemind);
router.get("/prescriptions/:appointmentId", isDoctorAuthenticated, getPrescriptionByAppointment);
router.put("/updatePrescriptions/:id", isDoctorAuthenticated, updatePrescription);

export default router;