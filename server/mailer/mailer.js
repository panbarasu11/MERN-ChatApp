import nodemailer from "nodemailer";
import dotenv from "dotenv";


dotenv.config();

//Create transporter
const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // Use SSL/TLS
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Allows self-signed certificates
  },
});



transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Connection Error:", error);
  } else {
    console.log("SMTP Connected Successfully!");
  }
});


// Function to send email
export const sendEmail = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: to,
      subject: subject,
      html: htmlContent, // HTML email content
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
