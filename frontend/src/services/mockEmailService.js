// Mock Email Verification Service
// This simulates email sending and verification without actual email integration

class MockEmailService {
  constructor() {
    // Store verification codes in localStorage for persistence
    this.storageKey = "smoofriends_verification_codes";
    this.sentEmailsKey = "smoofriends_sent_emails";
  }

  // Generate a 6-digit verification code
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Get stored verification codes
  getStoredCodes() {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : {};
  }

  // Get sent emails log
  getSentEmails() {
    const stored = localStorage.getItem(this.sentEmailsKey);
    return stored ? JSON.parse(stored) : [];
  }

  // Store verification code
  storeVerificationCode(email, code) {
    const codes = this.getStoredCodes();
    codes[email] = {
      code,
      timestamp: Date.now(),
      attempts: 0,
      verified: false,
    };
    localStorage.setItem(this.storageKey, JSON.stringify(codes));
  }

  // Log sent email for debugging
  logSentEmail(email, code, type = "verification") {
    const sentEmails = this.getSentEmails();
    sentEmails.push({
      email,
      code,
      type,
      timestamp: Date.now(),
      subject:
        type === "verification"
          ? "Verify your SMOOFriends account"
          : "Welcome to SMOOFriends",
    });

    // Keep only last 10 emails for storage efficiency
    if (sentEmails.length > 10) {
      sentEmails.splice(0, sentEmails.length - 10);
    }

    localStorage.setItem(this.sentEmailsKey, JSON.stringify(sentEmails));
  }

  // Simulate sending verification email
  async sendVerificationEmail(email, firstName = "") {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        const code = this.generateVerificationCode();
        this.storeVerificationCode(email, code);
        this.logSentEmail(email, code, "verification");

        // In development, log the code to console
        console.log(`📧 MOCK EMAIL SENT TO: ${email}`);
        console.log(`🔐 VERIFICATION CODE: ${code}`);
        console.log(`👋 Hi ${firstName}, welcome to SMOOFriends!`);

        resolve({
          success: true,
          message: "Verification email sent successfully",
          email,
          // In a real app, you wouldn't return the code
          debugCode: code, // Only for development/testing
        });
      }, 1000); // 1 second delay to simulate email sending
    });
  }

  // Verify the entered code
  async verifyCode(email, enteredCode) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const codes = this.getStoredCodes();
        const storedData = codes[email];

        if (!storedData) {
          resolve({
            success: false,
            message: "No verification code found for this email",
          });
          return;
        }

        // Check if code is expired (10 minutes)
        const isExpired = Date.now() - storedData.timestamp > 10 * 60 * 1000;
        if (isExpired) {
          resolve({
            success: false,
            message: "Verification code has expired. Please request a new one.",
          });
          return;
        }

        // Check attempts limit (max 3 attempts)
        if (storedData.attempts >= 3) {
          resolve({
            success: false,
            message:
              "Too many failed attempts. Please request a new verification code.",
          });
          return;
        }

        // Increment attempts
        storedData.attempts++;
        localStorage.setItem(this.storageKey, JSON.stringify(codes));

        // Check if code matches
        if (storedData.code === enteredCode.toString()) {
          storedData.verified = true;
          localStorage.setItem(this.storageKey, JSON.stringify(codes));

          console.log(`✅ EMAIL VERIFIED: ${email}`);

          resolve({
            success: true,
            message: "Email verified successfully!",
            email,
          });
        } else {
          resolve({
            success: false,
            message: `Invalid verification code. ${
              3 - storedData.attempts
            } attempts remaining.`,
          });
        }
      }, 500); // Shorter delay for verification
    });
  }

  // Check if email is already verified
  isEmailVerified(email) {
    const codes = this.getStoredCodes();
    const storedData = codes[email];
    return storedData && storedData.verified;
  }

  // Resend verification code
  async resendVerificationCode(email, firstName = "") {
    // Clear previous attempts
    const codes = this.getStoredCodes();
    if (codes[email]) {
      delete codes[email];
      localStorage.setItem(this.storageKey, JSON.stringify(codes));
    }

    return this.sendVerificationEmail(email, firstName);
  }

  // Get debug info (for development only)
  getDebugInfo() {
    return {
      storedCodes: this.getStoredCodes(),
      sentEmails: this.getSentEmails(),
    };
  }

  // Clear all verification data (for testing)
  clearAllData() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.sentEmailsKey);
    console.log("🧹 All verification data cleared");
  }
}

// Export singleton instance
export const mockEmailService = new MockEmailService();
export default mockEmailService;
