import nodemailer from "nodemailer";

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_PORT === "465",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send email function
export const sendEmail = async ({ to, subject, text, html }: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};