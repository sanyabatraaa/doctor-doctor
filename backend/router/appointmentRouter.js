import  express from "express";
import { deleteAppointment, getAllAppointments, postAppointment, updateAppointmentStatus , getMyAppointments } from "../controller/appointmentController.js";
import { isPatientAuthenticated, isAdminAuthenticated ,isDoctorAuthenticated} from "../middlewares/auth.js";

const router=express.Router();
router.post("/post",isPatientAuthenticated,postAppointment);
router.get("/getall",isAdminAuthenticated,getAllAppointments);
router.put("/update/:id",isAdminAuthenticated,updateAppointmentStatus)
router.delete("/delete/:id",isAdminAuthenticated,deleteAppointment);
router.get("/getPatientAppointments",isDoctorAuthenticated,getMyAppointments);
export default router;