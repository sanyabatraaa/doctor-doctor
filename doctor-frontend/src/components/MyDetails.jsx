import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MyDetails.css";

const MyDetails = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const { data } = await axios.get("http://localhost:4000/api/v1/user/doctor/me", { withCredentials: true });
        setUser(data.user);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load details");
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, []);

  if (loading) return <div className="details-loading">Loading...</div>;
  if (error) return <div className="details-error">{error}</div>;

  return (
    <div className="my-details-container">
      <div className="profile-card">
        <div className="profile-header">
          <img
            src={user.docAvatar?.url || "/default-avatar.png"}
            alt="Avatar"
            className="profile-avatar"
          />
          <h2>{user.firstName} {user.lastName}</h2>
          <p className="role">{user.role}</p>
        </div>

        <div className="profile-info">
          <h3>Personal Information</h3>
          <ul>
            <li><strong>Email:</strong> {user.email}</li>
            <li><strong>Phone:</strong> {user.phone}</li>
            <li><strong>NIC:</strong> {user.nic}</li>
            <li><strong>DOB:</strong> {new Date(user.dob).toLocaleDateString()}</li>
            <li><strong>Gender:</strong> {user.gender}</li>
          </ul>
        </div>

        {user.role === "Doctor" && (
          <div className="profile-info">
            <h3>Doctor Details</h3>
            <ul>
              <li><strong>Department:</strong> {user.doctorDepartment || "N/A"}</li>
              <li><strong>Qualifications:</strong> {user.qualifications?.join(", ") || "N/A"}</li>
              <li><strong>Experience:</strong> {user.experienceYears ? `${user.experienceYears} years` : "N/A"}</li>
              <li><strong>Clinic Address:</strong> {user.clinicAddress || "N/A"}</li>
              <li><strong>Consultation Fee:</strong> {user.consultationFee ? `$${user.consultationFee}` : "N/A"}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDetails;
