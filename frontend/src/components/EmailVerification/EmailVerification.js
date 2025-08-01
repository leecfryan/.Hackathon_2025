import React, { useState, useEffect } from "react";
import InputField from "../InputField/InputField";
import Button from "../Button/Button";
import mockEmailService from "../../services/mockEmailService";
import styles from "./EmailVerification.module.css";

const EmailVerification = ({
  email,
  firstName,
  onVerificationSuccess,
  onBack,
}) => {
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  // Start countdown timer for resend button
  useEffect(() => {
    setTimeLeft(60); // 60 seconds cooldown
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    if (value.length <= 6) {
      setVerificationCode(value);
      setError("");
      setSuccess("");
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();

    if (verificationCode.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await mockEmailService.verifyCode(email, verificationCode);

      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          onVerificationSuccess();
        }, 1500);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError("");
    setSuccess("");

    try {
      const result = await mockEmailService.resendVerificationCode(
        email,
        firstName
      );

      if (result.success) {
        setSuccess("New verification code sent!");
        setTimeLeft(60); // Reset countdown

        // Start new countdown
        const timer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError("Failed to resend code. Please try again.");
      }
    } catch (error) {
      setError("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={styles.verificationContainer}>
      <div className={styles.verificationHeader}>
        <div className={styles.emailIcon}>📧</div>
        <h2 className={styles.title}>Check Your Email</h2>
        <p className={styles.subtitle}>
          We've sent a 6-digit verification code to
        </p>
        <p className={styles.emailAddress}>{email}</p>
      </div>

      <form className={styles.verificationForm} onSubmit={handleVerifyCode}>
        {error && <div className={styles.errorBanner}>{error}</div>}
        {success && <div className={styles.successBanner}>{success}</div>}

        <div className={styles.codeInputContainer}>
          <InputField
            type="text"
            name="verificationCode"
            placeholder="Enter 6-digit code"
            label="Verification Code"
            value={verificationCode}
            onChange={handleCodeChange}
            maxLength={6}
            className={styles.codeInput}
            required
          />
          <div className={styles.codeHint}>
            Enter the 6-digit code from your email
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={isLoading}
          disabled={verificationCode.length !== 6}
        >
          Verify Email
        </Button>
      </form>

      <div className={styles.resendSection}>
        <p className={styles.resendText}>Didn't receive the code?</p>

        <div className={styles.resendActions}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleResendCode}
            loading={isResending}
            disabled={timeLeft > 0}
          >
            {timeLeft > 0 ? `Resend in ${formatTime(timeLeft)}` : "Resend Code"}
          </Button>

          <Button type="button" variant="ghost" onClick={onBack}>
            ← Back to Registration
          </Button>
        </div>
      </div>

      <div className={styles.helpSection}>
        <div className={styles.helpItem}>
          <span className={styles.helpIcon}>💡</span>
          <span>Check your spam/junk folder</span>
        </div>
        <div className={styles.helpItem}>
          <span className={styles.helpIcon}>⏰</span>
          <span>Code expires in 10 minutes</span>
        </div>
        <div className={styles.helpItem}>
          <span className={styles.helpIcon}>🔒</span>
          <span>Maximum 3 attempts per code</span>
        </div>
      </div>

      {/* Development Debug Panel */}
      {process.env.NODE_ENV === "development" && (
        <div className={styles.debugPanel}>
          <h4>🔧 Development Debug</h4>
          <p>Check browser console for the verification code</p>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              const debugInfo = mockEmailService.getDebugInfo();
              console.log("Debug Info:", debugInfo);
            }}
          >
            Log Debug Info
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmailVerification;
