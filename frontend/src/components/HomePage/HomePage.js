import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import Header from "../Header/Header";
import styles from "./HomePage.module.css";

const HomePage = () => {
  const { user } = useAuth();

  const extractUniversityFromEmail = (email) => {
    if (email && email.endsWith(".edu")) {
      const domain = email.split("@")[1];
      return domain.replace(".edu", "").replace(/\./g, " ").toUpperCase();
    }
    return "";
  };

  return (
    <div className={styles.homePage}>
      <Header />

      <div className={styles.mainContent}>
        <div className={styles.welcomeSection}>
          <h1 className={styles.welcomeTitle}>
            Welcome to SMOOFriends, {user?.firstName}!
          </h1>
          <p className={styles.welcomeSubtitle}>
            You're now connected to the{" "}
            {extractUniversityFromEmail(user?.email)} community
          </p>
          <div className={styles.userInfo}>
            <p className={styles.userDetail}>
              <strong>Name:</strong> {user?.firstName} {user?.lastName}
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
        </div>
      </div>
    </div>
  );
};

export default HomePage;
