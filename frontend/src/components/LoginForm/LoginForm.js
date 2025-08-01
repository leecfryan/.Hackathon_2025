import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import InputField from "../InputField/InputField";
import Button from "../Button/Button";
import styles from "./LoginForm.module.css";
import axios from "axios";

const LoginForm = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
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

    try {
      const response = await axios.post(
        "http://localhost:3001/users/login",
        formData
      );

      if (response.data.message === "success") {
        // Set user data in AuthContext first
        const userData = {
          email: formData.email,
          displayName:
            response.data?.displayName ||
            response.data?.firstName + " " + response.data?.lastName ||
            "Student",
          faculty: response.data?.faculty || "",
          yearOfStudy: response.data?.yearOfStudy || "",
          firstName: response.data?.firstName || "",
          lastName: response.data?.lastName || "",
        };

        login(userData);

        setIsLoading(false);
        if (onSuccess) {
          onSuccess();
        }

        // Navigate to HomePage after setting auth state
        navigate("/home");
      } else {
        setError("Invalid email or password. Please try again.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed. Please check your credentials and try again.");
      setIsLoading(false);
    }
  };

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
          <strong>Note:</strong> Use your school email to access SMOOFriends
        </p>
      </div>
    </form>
  );
};

export default LoginForm;
