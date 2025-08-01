import React, { useState } from "react";
import Button from "../Button/Button";
import InputField from "../InputField/InputField";
import SelectField from "../SelectField/SelectField";
import styles from "./MeetingForm.module.css";
import axios from "axios";

const MeetingForm = ({ isOpen, onClose, onSubmit }) => {
  const email = JSON.parse(localStorage.getItem("smoofriends_user")).email;

  const [formData, setFormData] = useState({
    email: email,
    activity: "",
    genderPreference: "any",
    facultyPreference: "any",
    yearPreference: "any",
    meetingDate: "",
    meetingHour: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const activityOptions = [
    { value: "", label: "Select an activity" },
    { value: "study", label: "Study Session" },
    { value: "coffee", label: "Coffee Chat" },
    { value: "lunch", label: "Lunch" },
    { value: "project", label: "Project Collaboration" },
    { value: "sports", label: "Sports/Exercise" },
    { value: "library", label: "Library Study" },
    { value: "discussion", label: "Academic Discussion" },
    { value: "networking", label: "Networking" },
    { value: "other", label: "Other" },
  ];

  const genderOptions = [
    { value: "any", label: "No preference" },
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
  ];

  const facultyOptions = [
    { value: "any", label: "No preference" },
    { value: "SCIS", label: "School of Computing and Information Systems" },
    { value: "LKCSB", label: "Lee Kong Chian School of Business" },
    { value: "SOSS", label: "School of Social Sciences" },
    { value: "SOE", label: "School of Economics" },
    { value: "SOA", label: "School of Accountancy" },
    { value: "LAW", label: "School of Law" },
  ];

  const yearOptions = [
    { value: "any", label: "No preference" },
    { value: "1", label: "Year 1" },
    { value: "2", label: "Year 2" },
    { value: "3", label: "Year 3" },
    { value: "4", label: "Year 4" },
    { value: "5", label: "Graduate Student" },
  ];

  const hourOptions = [
    { value: "", label: "Select time" },
    { value: "8", label: "8:00 AM" },
    { value: "9", label: "9:00 AM" },
    { value: "10", label: "10:00 AM" },
    { value: "11", label: "11:00 AM" },
    { value: "12", label: "12:00 PM" },
    { value: "13", label: "1:00 PM" },
    { value: "14", label: "2:00 PM" },
    { value: "15", label: "3:00 PM" },
    { value: "16", label: "4:00 PM" },
    { value: "17", label: "5:00 PM" },
    { value: "18", label: "6:00 PM" },
    { value: "19", label: "7:00 PM" },
    { value: "20", label: "8:00 PM" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.activity) {
      newErrors.activity = "Please select an activity";
    }

    if (!formData.meetingDate) {
      newErrors.meetingDate = "Please select a meeting date";
    } else {
      const selectedDate = new Date(formData.meetingDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.meetingDate = "Meeting date cannot be in the past";
      }
    }

    if (!formData.meetingHour) {
      newErrors.meetingHour = "Please select a meeting time";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      const response = await axios.post("http://localhost:3001/requests/submit", formData)
      console.log(response.data.message);
      if(response.data.message === "success") {
        // Reset form after successful submission
        setFormData({
          email: email,
          activity: "",
          genderPreference: "",
          facultyPreference: "",
          yearPreference: "",
          meetingDate: "",
          meetingHour: "",
        });
      } else {
        alert("Error submitting meeting request.")
      }
      setErrors({});
      onClose();

    } catch (error) {
      console.error("Error submitting meeting request:", error);
      setErrors({
        submit: "Failed to submit meeting request. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      email: email,
      activity: "",
      genderPreference: "any",
      facultyPreference: "any",
      yearPreference: "any",
      meetingDate: "",
      meetingHour: "",
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  // Get tomorrow's date as minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Arrange a Meeting</h2>
          <button className={styles.closeButton} onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <SelectField
                name="activity"
                label="Activity"
                value={formData.activity}
                onChange={handleInputChange}
                options={activityOptions}
                required
                error={errors.activity}
              />
            </div>

            <div className={styles.formGroup}>
              <SelectField
                name="genderPreference"
                label="Gender Preference"
                value={formData.genderPreference}
                onChange={handleInputChange}
                options={genderOptions}
                error={errors.genderPreference}
              />
            </div>

            <div className={styles.formGroup}>
              <SelectField
                name="facultyPreference"
                label="Faculty Preference"
                value={formData.facultyPreference}
                onChange={handleInputChange}
                options={facultyOptions}
                error={errors.facultyPreference}
              />
            </div>

            <div className={styles.formGroup}>
              <SelectField
                name="yearPreference"
                label="Year Preference"
                value={formData.yearPreference}
                onChange={handleInputChange}
                options={yearOptions}
                error={errors.yearPreference}
              />
            </div>

            <div className={styles.formGroup}>
              <InputField
                type="date"
                name="meetingDate"
                label="Meeting Date"
                value={formData.meetingDate}
                onChange={handleInputChange}
                min={minDate}
                required
                error={errors.meetingDate}
              />
            </div>

            <div className={styles.formGroup}>
              <SelectField
                name="meetingHour"
                label="Meeting Time"
                value={formData.meetingHour}
                onChange={handleInputChange}
                options={hourOptions}
                required
                error={errors.meetingHour}
              />
            </div>
          </div>

          {errors.submit && (
            <div className={styles.submitError}>{errors.submit}</div>
          )}

          <div className={styles.formActions}>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              Submit Meeting Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeetingForm;
