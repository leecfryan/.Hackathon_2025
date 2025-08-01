import React, { useState } from "react";
import styles from "./InputField.module.css";

const InputField = ({
  type = "text",
  name,
  label,
  placeholder,
  value,
  onChange,
  required = false,
  error,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputType = type === "password" && showPassword ? "text" : type;

  return (
    <div className={styles.inputField}>
      {label && (
        <label className={styles.inputLabel} htmlFor={name}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <div
        className={`${styles.inputContainer} ${
          isFocused ? styles.focused : ""
        } ${error ? styles.error : ""}`}
      >
        <input
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={styles.input}
          required={required}
          {...props}
        />

        {type === "password" && (
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={togglePasswordVisibility}
            tabIndex={-1}
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        )}
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};

export default InputField;
