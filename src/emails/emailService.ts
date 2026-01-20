import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: Number(process.env.MAIL_PORT) === 465,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * Verify transporter connection (optional but recommended)
 */
transporter.verify((error) => {
  if (error) {
    console.error("❌ Mail server connection failed:", error);
  } else {
    console.log("✅ Mail server is ready to send emails");
  }
});

/**
 * Send Email Helper
 */
export const sendEmail = async ({
  to,
  subject,
  html,
}: SendEmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"Elisha Global Service LTD" <${process.env.MAIL_FROM}>`,
      to,
      subject,
      html,
    });
  } catch (error: any) {
    console.error("❌ Failed to send email:", error.message);
    throw new Error("Email delivery failed");
  }
};
