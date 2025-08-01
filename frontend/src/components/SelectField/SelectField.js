import React from "react";
import styles from "./SelectField.module.css";

const SelectField = ({
  name,
  label,
  value,
  onChange,
  options = [],
  required = false,
  error,
  ...props
}) => {
  return (
    <div className={styles.selectField}>
      {label && (
        <label className={styles.selectLabel} htmlFor={name}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <div className={`${styles.selectContainer} ${error ? styles.error : ""}`}>
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={styles.select}
          required={required}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className={styles.selectArrow}>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path
              d="M1 1L6 6L11 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};

export default SelectField;
