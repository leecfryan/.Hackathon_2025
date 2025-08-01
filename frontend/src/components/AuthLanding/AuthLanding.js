import React, { useState } from "react";
import LoginForm from "../LoginForm/LoginForm";
import RegisterForm from "../RegisterForm/RegisterForm";
import styles from "./AuthLanding.module.css";

const AuthLanding = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className={styles.authLanding}>
      <div className={styles.authContainer}>
        <div className={styles.authHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="url(#gradient)" />
                <path
                  d="M16 8C12.686 8 10 10.686 10 14C10 17.314 12.686 20 16 20C19.314 20 22 17.314 22 14C22 10.686 19.314 8 16 8Z"
                  fill="white"
                />
                <path
                  d="M8 24C8 20.686 11.582 18 16 18C20.418 18 24 20.686 24 24V26H8V24Z"
                  fill="white"
                />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
                    <stop stopColor="#667eea" />
                    <stop offset="1" stopColor="#764ba2" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1>SMOOFriends</h1>
          </div>
          <p className={styles.authSubtitle}>
            {isLogin
              ? "Welcome back to your university community!"
              : "Join your university community with your school email."}
          </p>
        </div>

        <div className={styles.formContainer}>
          <div className={styles.formTabs}>
            <button
              className={`${styles.tab} ${isLogin ? styles.active : ""}`}
              onClick={() => setIsLogin(true)}
            >
              Sign In
            </button>
            <button
              className={`${styles.tab} ${!isLogin ? styles.active : ""}`}
              onClick={() => setIsLogin(false)}
            >
              Join Community
            </button>
          </div>

          <div className={styles.formContent}>
            {isLogin ? <LoginForm /> : <RegisterForm />}
          </div>

          <div className={styles.authFooter}>
            <p>
              {isLogin
                ? "New to SMOOFriends? "
                : "Already part of the community? "}
              <button className={styles.linkButton} onClick={toggleForm}>
                {isLogin ? "Join now" : "Sign in"}
              </button>
            </p>
          </div>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🎓</div>
            <span>University Verified</span>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>👥</div>
            <span>Student Community</span>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🔒</div>
            <span>Secure & Private</span>
          </div>
        </div>

        <div className={styles.universityNotice}>
          <p>
            <strong>University Students Only:</strong> You must use your
            official school email address (.edu) to create an account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLanding;
