import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Header from "../Header/Header";
import MeetingForm from "../MeetingForm/MeetingForm";
import styles from "./HomePage.module.css";

const HomePage = () => {
  const { user } = useAuth();
  const [showMeetingForm, setShowMeetingForm] = useState(false);

  const extractUniversityFromEmail = (email) => {
    if (email && email.endsWith(".edu")) {
      const domain = email.split("@")[1];
      return domain.replace(".edu", "").replace(/\./g, " ").toUpperCase();
    }
    return "";
  };

  const handleMeetingRequest = async (meetingData) => {
    try {
      // TODO: Replace with actual API call to your backend
      console.log("Meeting request submitted:", {
        ...meetingData,
        userId: user.id,
        userEmail: user.email,
        userName: user.displayName,
        userFaculty: user.faculty,
        userYear: user.yearOfStudy,
        userGender: user.gender,
        submittedAt: new Date().toISOString(),
      });

      // For now, just show success message
      alert(
        "Meeting request submitted successfully! We'll match you with compatible students."
      );

      // Here you would typically make an API call like:
      // const response = await axios.post('/api/meeting-requests', {
      //   ...meetingData,
      //   userId: user.id
      // });
    } catch (error) {
      console.error("Error submitting meeting request:", error);
      throw error;
    }
  };

  return (
    <div className={styles.homePage}>
      <Header />

      <div className={styles.mainContent}>
        <div className={styles.welcomeSection}>
          <h1 className={styles.welcomeTitle}>
            Welcome to SMOOFriends, {user?.displayName}!
          </h1>
          <p className={styles.welcomeSubtitle}>
            You're now connected to the{" "}
            {extractUniversityFromEmail(user?.email)} community
          </p>
          <div className={styles.userInfo}>
            <p className={styles.userDetail}>
              <strong>Name:</strong> {user?.displayName}
            </p>
            <p className={styles.userDetail}>
              <strong>Email:</strong> {user?.email}
            </p>
            <p className={styles.userDetail}>
              <strong>Faculty:</strong> {user?.faculty}
            </p>
            <p className={styles.userDetail}>
              <strong>Year:</strong> {user?.yearOfStudy}
            </p>
          </div>

          <div className={styles.quickActions}>
            <Link to="/heatmap" className={styles.actionButton}>
              <div className={styles.actionIcon}>🗺️</div>
              <div className={styles.actionContent}>
                <h3>Campus HeatMap</h3>
                <p>View crowded locations on campus</p>
              </div>
            </Link>

            <Link to="/chat" className={styles.actionButton}>
              <div className={styles.actionIcon}>💬</div>
              <div className={styles.actionContent}>
                <h3>Chat with Students</h3>
                <p>Connect and chat with fellow SMU students</p>
              </div>
            </Link>

            <button
              className={styles.actionButton}
              onClick={() => setShowMeetingForm(true)}
            >
              <div className={styles.actionIcon}>🤝</div>
              <div className={styles.actionContent}>
                <h3>Arrange Meeting</h3>
                <p>Find students to meet based on your preferences</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <MeetingForm
        isOpen={showMeetingForm}
        onClose={() => setShowMeetingForm(false)}
        onSubmit={handleMeetingRequest}
      />
    </div>
  );
};

export default HomePage;
