import { Application } from "../models/applicationSchem.js"
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js"
import cloudinary from 'cloudinary'
import {Job} from "../models/jobSchema.js"

export const employerGetAllApplication = catchAsyncErrors(async (req, res, next) => {
    const { role } = res.User();
    if (role === "Job Seeker") {
        return next(new ErrorHandler
            ("Job Seeker is not allowed to access this resource!", 400)
        )
    }
    const { _id } = req.User;
    const applications = await Application.find({ 'employerID.user': _id });
    res.status(200).json({
        sucess: true,
        applications
    })
})


export const jobseekerGetAllApplication = catchAsyncErrors(async (req, res, next) => {
    const { role } = res.User();
    if (role === "Employer") {
        return next(new ErrorHandler
            ("Job Seeker is not allowed to access this resource!", 400)
        )
    }
    const { _id } = req.User;
    const applications = await Application.find({ 'applicantID.user': _id });
    res.status(200).json({
        sucess: true,
        applications
    })
})

export const JobSeekerDeleteApplication = catchAsyncErrors(async (req, res, next) => {
    const { role } = res.User();
    if (role === "Job Seeker") {
        return next(new ErrorHandler
            ("Job Seeker is not allowed to access this resource!", 400)
        )
    }
    const { id } = req.params;
    const applications = await Application.findById(id); {
        if (!applications) {
            return next(new ErrorHandler("Oops, application not found, 404"))
        }
        await applications.deleteOne();
        res.status(200).json({
            sucess: true,
            message: "Application Deleted Duccessfull!"
        })
    }
})
export const postApplication = catchAsyncErrors(async (req, res, next) => {
    const { role } = res.User();
    if (role === "Employer") {
        return next(
            new ErrorHandler(
                "Job Seeker is not allowed to access this resource!",
                400
            )
        );
    }
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Resume File Required"));
    }
    const { resume } = req.files;
    const allowedFormats = ["image/png", "image/jpg", "image/webp"];
    if (!allowedFormats.includes(resume.mimetype)) {
        return next(new ErrorHandler("Invalid file type. Please upload your resume in a PNG, JPG, WEBP format", 400))
    }
    const cloudinaryResponse = await cloudinary.UploadStream.upload(
        resume.tempFilePath
    );
    if (!cloudinaryResponse || cloudinaryResponse.error) {
        console.error(
            "Cloudinary Error:",
            cloudinaryResponse.error || "unknown cloudinary Error"
        );
        return next(new ErrorHandler("Failed to upload resume", 500));
    }
    const { name, email, coverLetter, phone, address, jobId } = req.body;
    const applcantID = {
        User: req.User._id,
        role: "Job Seeker",
    };
    if (!jobId) {
        return next(new ErrorHandler("Jon not found!", 404));
    };
    const jobDetails = await Job.findById(jobId)
    if (!jobDetails) {
        return next(new ErrorHandler("Jon not found!", 404));
    }
    const employerID = {
        User: jobDetails.postedBy,
        role: "Employer",
    };
    if (
        !name ||
        !email ||
        !coverLetter ||
        !phone ||
        !address ||
        !applcantID ||
        !employerID ||
        !resume
    ) {
        returnnext(new ErrorHandler("Please fill all field!", 400))
    }
    const application = await Application.create({
        name,
        email,
        coverLetter,
        phone,
        address,
        applcantID,
        employerID,
        resume: {
            publice_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        }
    });
res.status(200).json({
    success:true,
    message:"Application Submited!",
    application,
})
})       