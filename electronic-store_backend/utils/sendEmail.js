import dotenv from "dotenv";
dotenv.config(); // ⚡ phải gọi ngay đầu file

import sgMail from "@sendgrid/mail";

if (!process.env.SENDGRID_API_KEY || !process.env.EMAIL_FROM) {
  console.error("❌ SendGrid config missing!");
  process.exit(1);
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, html) => {
  try {
    const msg = { to, from: process.env.EMAIL_FROM, subject, html };
    const response = await sgMail.send(msg);
    console.log("✅ Email sent via SendGrid:", response[0].statusCode);
    return true;
  } catch (error) {
    console.error("❌ SendGrid error:", error.response?.body || error.message);
    return false;
  }
};

export default sendEmail;