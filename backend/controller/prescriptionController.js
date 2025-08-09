import { Prescription } from "../models/prescriptionSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { User } from "../models/userSchema.js";
import { Appointment } from "../models/appointmentSchema.js";

// Utility function to validate time format (HH:mm)
const isValidTimeFormat = (time) => {
  const regex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(time);
};

// Utility function to validate date format (ISO 8601)
const isValidISODate = (dateStr) => {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

export const createPrescription = catchAsyncErrors(async (req, res, next) => {
  const {
    patientId,
    appointmentId,
    medicineName,
    dosage,
    frequency,
    reminderTimes,
    startDate,
    endDate,
    reminderMedium,
  } = req.body;

  // Check required fields
  if (
    !patientId ||
    !appointmentId ||
    !medicineName ||
    !dosage ||
    !frequency ||
    !reminderTimes ||
    !startDate ||
    !endDate
  ) {
    return next(new ErrorHandler("Please fill all required fields!", 400));
  }

  // Validate patient exists and is a real patient
  const patient = await User.findById(patientId);
  if (!patient || patient.role !== "Patient") {
    return next(new ErrorHandler("Invalid patient ID", 400));
  }

  // Validate appointment exists
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return next(new ErrorHandler("Invalid appointment ID", 400));
  }

  const doctorId = req.user._id; // Logged in doctor

  // Check that appointment belongs to this doctor
  if (appointment.doctorId.toString() !== doctorId.toString()) {
    return next(new ErrorHandler("Unauthorized to prescribe for this appointment", 403));
  }

  // Check that appointment was booked by this patient
  if (appointment.patientId.toString() !== patientId.toString()) {
    return next(new ErrorHandler("Patient and appointment mismatch", 400));
  }

  // Validate reminderTimes format
  if (
    !Array.isArray(reminderTimes) ||
    reminderTimes.some((time) => !isValidTimeFormat(time))
  ) {
    return next(
      new ErrorHandler("Reminder times must be in HH:mm format.", 400)
    );
  }

  // Validate date formats
  if (!isValidISODate(startDate) || !isValidISODate(endDate)) {
    return next(new ErrorHandler("Start and end dates must be valid.", 400));
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < start) {
    return next(
      new ErrorHandler("End date must be after the start date.", 400)
    );
  }

  // Validate reminderMedium if provided
  const validMediums = ["sms", "email", "whatsapp"];
  if (
    reminderMedium &&
    !validMediums.includes(reminderMedium.toLowerCase())
  ) {
    return next(
      new ErrorHandler(
        "Reminder medium must be one of: sms, email, or whatsapp.",
        400
      )
    );
  }

  const prescription = await Prescription.create({
    patientId,
    doctorId,
    appointmentId,
    medicineName,
    dosage,
    frequency,
    reminderTimes,
    startDate,
    endDate,
    reminderMedium,
  });

  res.status(201).json({
    success: true,
    message: "Prescription added successfully!",
    prescription,
  });
});

// This controller will be called by n8n every 15 minutes
export const getPrescriptionsToRemind = async (req, res) => {
  try {
    const { time } = req.query; // expected "HH:mm" format

    if (!time) {
      return res.status(400).json({ error: "Missing time parameter in query." });
    }

    const now = new Date();
    console.log("🔍 Checking reminders for time:", time, " at server time:", now.toISOString());

    // Step 1: Get prescriptions matching current time
    const prescriptions = await Prescription.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      reminderTimes: { $elemMatch: { $regex: `^${time.trim()}`, $options: "i" } }
    }).lean(); // lean() for plain JS objects

    console.log("✅ Found prescriptions:", prescriptions.length);

    // Step 2: Get all patient IDs from prescriptions
    const patientIds = prescriptions.map(p => p.patientId);

    // Step 3: Fetch patients from User collection
    const patients = await User.find(
      { _id: { $in: patientIds } },
      { firstName: 1, lastName: 1, email: 1, phone: 1 }
    ).lean();

    // Step 4: Map patients by ID for quick lookup
    const patientMap = {};
    patients.forEach(p => {
      patientMap[p._id] = p;
    });

    // Step 5: Merge patient data with prescriptions
    const result = prescriptions.map(p => {
      const patient = patientMap[p.patientId] || {};
      return {
        patientName: `${patient.firstName || ""} ${patient.lastName || ""}`.trim() || "Unknown",
        patientEmail: patient.email || "",
        patientPhone: patient.phone || "",
        medicineName: p.medicineName,
        dosage: p.dosage,
        reminderTimes: p.reminderTimes,
        reminderMedium: p.reminderMedium
      };
    });

    res.json(result);
  } catch (error) {
    console.error("❌ Error in getPrescriptionsToRemind:", error);
    res.status(500).json({ error: error.message });
  }
};

