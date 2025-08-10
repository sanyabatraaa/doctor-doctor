import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema= new mongoose.Schema({
  firstName: { type: String, required: true, minLength: 3 },
  lastName: { type: String, required: true, minLength: 3 },
  email: { type: String, required: true, validate: [validator.isEmail, "Please Provide a Valid Email!"] },
  phone: { type: String, required: true, minLength: 10, maxLength: 10 },
  nic: { type: String, required: true, minLength: 13, maxLength: 13 },
  dob: { type: Date, required: true },
  gender: { type: String, required: true, enum: ["Male", "Female"] },
  password: { type: String, minLength: 8, select: false },
  role: { type: String, required: true, enum: ["Admin", "Patient", "Doctor"] },

  // Doctor-specific
  doctorDepartment: { type: String },
  qualifications: { type: [String] },
  experienceYears: { type: Number },
  clinicAddress: { type: String },
  consultationFee: { type: Number },
  availability: [{
    day: { type: String }, // e.g., Monday
    startTime: { type: String }, // e.g., 09:00
    endTime: { type: String } // e.g., 17:00
  }],

  // Account control
  status: { type: String, enum: ["Active", "Inactive", "Banned"], default: "Active" },
  emailVerified: { type: Boolean, default: false },
  verificationToken: String,
  passwordChangedAt: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: Date,

  // Avatar
  docAvatar: {
    public_id: String,
    url: String,
  },


  //blood donation
  badges: [String],
  streakCount: { type: Number, default: 0 },
  totalDonations: { type: Number, default: 0 },
  donations: [
    {
      date: { type: Date, required: true },
      center: { type: mongoose.Schema.Types.ObjectId, ref: "donationSchema" }
    }
  ]
}, { timestamps: true })


userSchema.pre("save", async function (next){
    if(!this.isModified("password")){
        next();
    }
    this.password= await bcrypt.hash(this.password,10);
});

userSchema.methods.comparePassword=async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
};

userSchema.methods.generateJsonWebToken=function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET_KEY,{
        expiresIn:process.env.JWT_EXPIRES,
    });
}
export const User= mongoose.model("User",userSchema);
