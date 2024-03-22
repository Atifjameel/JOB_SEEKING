import express from "express";
import {
  employerGetAllApplication,
  JobSeekerDeleteApplication,
  jobseekerGetAllApplication,
  postApplication,
} from "../controllers/applicationController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/post", isAuthenticated, postApplication);
router.get("/employer/getall", isAuthenticated, employerGetAllApplication);
router.get("/jobseeker/getall", isAuthenticated, jobseekerGetAllApplication);
router.delete("/delete/:id", isAuthenticated, JobSeekerDeleteApplication);

export default router;