import React, { useState } from "react";
import InputField from "../InputField/InputField";
import SelectField from "../SelectField/SelectField";
import Button from "../Button/Button";
import EmailVerification from "../EmailVerification/EmailVerification";
import mockEmailService from "../../services/mockEmailService";
import styles from "./RegisterForm.module.css";
import axios from "axios";

const RegisterForm = ({ onSuccess }) => {
  const [currentStep, setCurrentStep] = useState("register"); // 'register' or 'verify'
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    faculty: "",
    gender: "",
    yearOfStudy: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const facultyOptions = [
    { value: "", label: "Select your faculty" },
    { value: "arts", label: "Arts & Humanities" },
    { value: "business", label: "Business & Economics" },
    { value: "engineering", label: "Engineering & Technology" },
    { value: "science", label: "Science & Mathematics" },
    { value: "medicine", label: "Medicine & Health Sciences" },
    { value: "law", label: "Law" },
    { value: "education", label: "Education" },
    { value: "social", label: "Social Sciences" },
    { value: "other", label: "Other" },
  ];

  const yearOptions = [
    { value: "", label: "Select year" },
    { value: "1", label: "Freshman (1st Year)" },
    { value: "2", label: "Sophomore (2nd Year)" },
    { value: "3", label: "Junior (3rd Year)" },
    { value: "4", label: "Senior (4th Year)" },
    { value: "5", label: "Graduate Student" },
    { value: "6", label: "PhD Student" },
  ];

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

  const extractUniversityFromEmail = (email) => {
    if (email.endsWith(".edu")) {
      const domain = email.split("@")[1];
      return domain.replace(".edu", "").replace(/\./g, " ").toUpperCase();
    }
    return "";
  };

  async function checkEmailExists(email) {
    try {
      const res = await axios.get("http://localhost:3001/users/checkIfEmailExists", {
        params: { email }
      });
      return res.data.exists; // true or false
    } catch (err) {
      console.error("Error checking email:", err);
      return false;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateSchoolEmail(formData.email)) {
      setError("Please use your official school email address (.edu)");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    const exists = await checkEmailExists(formData.email);
    if(exists) {
      setError("Email is already in use");
      return;
    }

    setIsLoading(true);

    try {
      // Send verification email
      const result = await mockEmailService.sendVerificationEmail(
        formData.email,
        formData.firstName
      );

      if (result.success) {
        console.log("Registration data prepared:", formData);
        setCurrentStep("verify");
      } else {
        setError("Failed to send verification email. Please try again.");
      }
    } catch (error) {
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    console.log("Email verified successfully for:", formData.email);
    console.log("Complete registration data:", formData);

    // Here you would typically save the user data to your backend
    // For now, we'll just call the success callback
    axios.post("http://localhost:3001/users/register", formData)
      .then((res) => {
        console.log(res);
      })

    if (onSuccess) {
      onSuccess();
    } else {
      alert("Registration completed successfully! Welcome to SMOOFriends!");
    }
  };

  const handleBackToRegistration = () => {
    setCurrentStep("register");
  };

  // Show verification step
  if (currentStep === "verify") {
    return (
      <EmailVerification
        email={formData.email}
        firstName={formData.firstName}
        onVerificationSuccess={handleVerificationSuccess}
        onBack={handleBackToRegistration}
      />
    );
  }

  // Show registration form
  return (
    <form className={styles.registerForm} onSubmit={handleSubmit}>
      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.formFields}>
        <div className={styles.nameFields}>
          <InputField
            type="text"
            name="firstName"
            placeholder="First name"
            label="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
          />

          <InputField
            type="text"
            name="lastName"
            placeholder="Last name"
            label="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <InputField
          type="email"
          name="email"
          placeholder="Enter your school email (.edu)"
          label="School Email Address"
          value={formData.email}
          onChange={handleChange}
          required
        />

        {formData.email && validateSchoolEmail(formData.email) && (
          <div className={styles.universityDetected}>
            <span>
              🎓 University detected:{" "}
              {extractUniversityFromEmail(formData.email)}
            </span>
          </div>
        )}

        <div className={styles.studentFields}>
          <SelectField
            name="faculty"
            label="Faculty/Department"
            value={formData.faculty}
            onChange={handleChange}
            options={facultyOptions}
            required
          />

          <div className={styles.genderField}>
            <label className={styles.fieldLabel}>
              Gender <span className={styles.required}>*</span>
            </label>
            <div className={styles.radioGroup}>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="gender"
                  value="m"
                  checked={formData.gender === "m"}
                  onChange={handleChange}
                  required
                />
                <span className={styles.radioButton}></span>
                Male
              </label>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="gender"
                  value="f"
                  checked={formData.gender === "f"}
                  onChange={handleChange}
                  required
                />
                <span className={styles.radioButton}></span>
                Female
              </label>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="gender"
                  value="other"
                  checked={formData.gender === "other"}
                  onChange={handleChange}
                  required
                />
                <span className={styles.radioButton}></span>
                Other
              </label>
            </div>
          </div>

          <SelectField
            name="yearOfStudy"
            label="Year of Study"
            value={formData.yearOfStudy}
            onChange={handleChange}
            options={yearOptions}
            required
          />
        </div>

        <div className={styles.passwordFields}>
          <InputField
            type="password"
            name="password"
            placeholder="Create a strong password (8+ characters)"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <InputField
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className={styles.termsContainer}>
        <label className={styles.checkboxContainer}>
          <input type="checkbox" required />
          <span className={styles.checkmark}></span>I agree to the{" "}
          <a href="#" className={styles.termsLink}>
            SMOOFriends Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className={styles.termsLink}>
            Privacy Policy
          </a>
        </label>
      </div>

      <Button type="submit" variant="primary" fullWidth loading={isLoading}>
        Create Account & Send Verification
      </Button>

      <div className={styles.verificationNotice}>
        <p>
          📧 We'll send a 6-digit verification code to your school email for
          confirmation.
        </p>
      </div>
    </form>
  );
};

export default RegisterForm;
