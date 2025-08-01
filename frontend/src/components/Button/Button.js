import React from "react";
import styles from "./Button.module.css";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "medium",
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  ...props
}) => {
  const buttonClasses = [
    styles.button,
    styles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    styles[`button${size.charAt(0).toUpperCase() + size.slice(1)}`],
    fullWidth ? styles.buttonFullWidth : "",
    loading ? styles.buttonLoading : "",
    disabled ? styles.buttonDisabled : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className={styles.buttonSpinner}>
          <div className={styles.spinner}></div>
        </div>
      )}
      <span className={loading ? styles.buttonTextHidden : styles.buttonText}>
        {children}
      </span>
    </button>
  );
};

export default Button;
