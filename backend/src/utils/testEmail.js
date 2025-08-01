import { sendVerificationEmail } from "./sendEmail.js";

const testEmail = "anson.poh.2024@smu.edu.sg"; // Replace with test email
const code = Math.floor(100000 + Math.random() * 900000); // Random 6-digit code

sendVerificationEmail(testEmail, code);
