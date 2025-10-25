import React, { useEffect, useState } from "react";
import api from "../api";
import "./Profile.css"; // We will create this file next
import { toast } from "react-toastify";

function Profile() {
  const [user, setUser] = useState(null);
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (userId) {
      // Fetch user data from the /users/<id>/ endpoint
      api.get(`/users/${userId}/`)
        .then(res => {
          setUser(res.data);
        })
        .catch(err => {
          console.error("Error fetching user data:", err);
          toast.error("Could not fetch user profile.");
        });
    }
  }, [userId]);

  const handleLogout = () => {
    // Clear ALL user data from storage
    localStorage.removeItem("token");
    localStorage.removeItem("user_id"); 
    
    toast.success("Logged out successfully! Redirecting...");
    
    // Force a full reload to the login page
    setTimeout(() => {
        window.location.href = "/";
    }, 1500);
  };

  if (!user) {
    return (
        <div className="profile-container">
            <div className="profile-card">Loading profile...</div>
        </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1 className="profile-title">My Profile</h1>
        <div className="profile-info">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Member Since:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
        </div>
        <button onClick={handleLogout} className="profile-logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
}

export default Profile;

