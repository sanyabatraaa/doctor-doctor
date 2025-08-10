import { User } from "../models/userSchema.js";
import {Donation} from "../models/donationSchema.js"; // adjust path if different
import mongoose from "mongoose"; 

// 📌 Register a Blood Donation
export const registerDonation = async (req, res) => {
  try {
    const userId = req.user._id;  
    const { centerId, date } = req.body;

    if (!centerId || !date) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    // 1️⃣ Find User & Center
    const user = await User.findById(userId);
    const center = await Donation.findById(centerId);

    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    if (!center) return res.status(404).json({ success: false, message: "Donation center not found." });

    const donationDate = new Date(date);
    const donationMonth = donationDate.getMonth();
    const donationYear = donationDate.getFullYear();

    // 2️⃣ Check if user already donated this month
    const alreadyDonatedThisMonth = user.donations.some(donation => {
      const d = new Date(donation.date);
      return d.getMonth() === donationMonth && d.getFullYear() === donationYear;
    });

    // 3️⃣ Add donation record to user
    user.donations.push({ date: donationDate, center: centerId });
    user.totalDonations += 1;

    // 4️⃣ Update streak only if no donation in this month yet
    if (!alreadyDonatedThisMonth) {
      user.streakCount += 1;
    }

    // 5️⃣ Assign badges based on milestones
    if (user.totalDonations === 1 && !user.badges.includes("First Donation")) {
      user.badges.push("First Donation");
    }
    if (user.totalDonations === 5 && !user.badges.includes("5 Donations")) {
      user.badges.push("5 Donations");
    }
    if (user.totalDonations === 10 && !user.badges.includes("10 Donations")) {
      user.badges.push("10 Donations");
    }

    // 6️⃣ Update donation center stats
    center.totalDonations += 1;
    if (!center.donors.includes(userId)) {
      center.donors.push(userId);
    }

    // 7️⃣ Save changes
    await user.save();
    await center.save();

    res.status(201).json({
      success: true,
      message: "Donation registered successfully.",
      user,
      center
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addDonationCenter = async (req, res) => {
  try {
    const { name, city, address, contactNumber } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Center name is required." });
    }

    // Create new donation center
    const newCenter = new Donation({
      name,
      city,
      address,
      contactNumber,
      totalDonations: 0,
      donors: []
    });

    await newCenter.save();

    res.status(201).json({
      success: true,
      message: "Donation center added successfully.",
      center: newCenter
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Get a user's donation history
export const getDonationHistory = async (req, res) => {
  try {
    const userId  = req.user._id;

    const user = await User.findById(userId)
      .populate("donations.center", "name city address contactNumber")
      .select("firstName lastName totalDonations streakCount badges donations");

    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    res.status(200).json({ success: true, donationHistory: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Get all donation centers with stats
export const getDonationCenters = async (req, res) => {
  try {
    const centers = await Donation.find()
      .populate("donors", "firstName lastName email")
      .sort({ totalDonations: -1 });

    res.status(200).json({ success: true, centers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Get leaderboard of top donors
export const getTopDonors = async (req, res) => {
  try {
    const donors = await User.find({ totalDonations: { $gt: 0 } })
      .sort({ totalDonations: -1 })
      .limit(10)
      .select("firstName lastName totalDonations badges");

    res.status(200).json({ success: true, donors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
