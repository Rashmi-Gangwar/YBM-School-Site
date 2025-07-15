import nodemailer from "nodemailer";
import "dotenv/config";

export const sendEmail = async ({ email, subject, message }) => {

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GOOGLE_MAIL,
        pass: process.env.GOOGLE_APP_PASSWORD,
      },
    });
    await transporter.sendMail({
      from: process.env.GOOGLE_MAIL,
      to: email,
      subject: subject,
      text: null,
      html: message,
    });
    return "Email Send Successfully";
  } catch (error) {
    console.error("Error in : ", error.message);
    return {
      message: `Error in : ${error.message}`,
    };
  }
};
