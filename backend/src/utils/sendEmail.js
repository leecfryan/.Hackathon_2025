import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export async function sendVerificationEmail(userEmail, verificationCode) {
  try {
    // 1. Create transporter for Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
        tls: {
            rejectUnauthorized: false, // 👈 Accept self-signed certs
        },
    });

    // 2. Send email with custom display name
    const info = await transporter.sendMail({
      from: `"noreply<MyApp>" <${process.env.MAIL_USER}>`, // 👈 Display name
      to: userEmail,
      subject: "Your Verification Code",
      text: `Your verification code is: ${verificationCode}`,
    });

    console.log("✅ Email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
}