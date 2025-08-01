import React, { useState } from "react";
import InputField from "../InputField/InputField";
import Button from "../Button/Button";
import EmailVerification from "../EmailVerification/EmailVerification";
import mockEmailService from "../../services/mockEmailService";
import styles from "./LoginForm.module.css";

const LoginForm = ({ onSuccess }) => {
  const [currentStep, setCurrentStep] = useState("login"); // 'login' or 'verify'
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const validateSchoolEmail = (email) => {
    return email.endsWith(".edu") || email.includes(".edu.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateSchoolEmail(formData.email)) {
      setError("Please use your official school email address (.edu)");
      return;
    }

    setIsLoading(true);

    // Simulate login validation
    setTimeout(async () => {
      console.log("Login attempt:", formData);

      // Check if email is already verified
      const isVerified = mockEmailService.isEmailVerified(formData.email);

      if (isVerified) {
        // Email is verified, proceed with login
        setIsLoading(false);
        if (onSuccess) {
          onSuccess();
        } else {
          alert("Login successful! Welcome back to SMOOFriends!");
        }
      } else {
        // Email not verified, send verification code
        try {
          const result = await mockEmailService.sendVerificationEmail(
            formData.email
          );

          if (result.success) {
            setIsLoading(false);
            setCurrentStep("verify");
          } else {
            setError("Failed to send verification email. Please try again.");
            setIsLoading(false);
          }
        } catch (error) {
          setError("Login failed. Please try again.");
          setIsLoading(false);
        }
      }
    }, 1000);
  };

  const handleVerificationSuccess = () => {
    console.log("Email verified successfully for login:", formData.email);

    if (onSuccess) {
      onSuccess();
    } else {
      alert("Email verified! Login successful! Welcome to SMOOFriends!");
    }
  };

  const handleBackToLogin = () => {
    setCurrentStep("login");
  };

  // Show verification step
  if (currentStep === "verify") {
    return (
      <EmailVerification
        email={formData.email}
        firstName="" // We don't have first name in login
        onVerificationSuccess={handleVerificationSuccess}
        onBack={handleBackToLogin}
      />
    );
  }

  // Show login form
  return (
    <form className={styles.loginForm} onSubmit={handleSubmit}>
      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.formFields}>
        <InputField
          type="email"
          name="email"
          placeholder="Enter your school email"
          label="School Email Address"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <InputField
          type="password"
          name="password"
          placeholder="Enter your password"
          label="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formOptions}>
        <label className={styles.checkboxContainer}>
          <input type="checkbox" />
          <span className={styles.checkmark}></span>
          Remember me
        </label>

        <button type="button" className={styles.forgotPassword}>
          Forgot password?
        </button>
      </div>

      <Button type="submit" variant="primary" fullWidth loading={isLoading}>
        Sign In to SMOOFriends
      </Button>

      <div className={styles.schoolEmailNotice}>
        <p>
          <strong>Note:</strong> First-time login requires email verification
        </p>
      </div>
    </form>
  );
};

export default LoginForm;
