// Option 1: Express.js API Route - backend/routes/email.js
import express from "express";
import { sendVerificationEmail } from "../utils/sendEmail.js";

const router = express.Router();

// In-memory store for verification codes (use database in production)
const verificationCodes = new Map();

router.post("/send-verification", async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Send email
    const result = await sendVerificationEmail(email, verificationCode);

    if (result.success) {
      // Store verification code with expiration (10 minutes)
      verificationCodes.set(email, {
        code: verificationCode,
        expires: Date.now() + 10 * 60 * 1000, // 10 minutes
        attempts: 0,
      });

      res.status(200).json({
        success: true,
        message: "Verification email sent successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send verification email",
      });
    }
  } catch (error) {
    console.error("Email sending failed:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Endpoint to verify the code
router.post("/verify-code", async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and code are required",
      });
    }

    const storedData = verificationCodes.get(email);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: "No verification code found for this email",
      });
    }

    // Check expiration
    if (Date.now() > storedData.expires) {
      verificationCodes.delete(email);
      return res.status(400).json({
        success: false,
        message: "Verification code has expired",
      });
    }

    // Check attempts (max 3)
    if (storedData.attempts >= 3) {
      verificationCodes.delete(email);
      return res.status(400).json({
        success: false,
        message: "Too many failed attempts. Please request a new code.",
      });
    }

    // Verify code
    if (storedData.code === code) {
      verificationCodes.delete(email); // Remove after successful verification
      res.status(200).json({
        success: true,
        message: "Email verified successfully",
      });
    } else {
      // Increment attempts
      storedData.attempts += 1;
      verificationCodes.set(email, storedData);

      res.status(400).json({
        success: false,
        message: `Invalid verification code. ${
          3 - storedData.attempts
        } attempts remaining.`,
      });
    }
  } catch (error) {
    console.error("Verification failed:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
