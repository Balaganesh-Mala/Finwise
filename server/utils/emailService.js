const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, 
  },
  // Add timeout settings
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 5000,    // 5 seconds
  socketTimeout: 10000,     // 10 seconds
  debug: true,              // show debug output
  logger: true              // log information in console
});

const sendEmail = async (to, subject, html) => {
  try {
    console.log(`Sending email to: ${to} via ${process.env.MAIL_HOST}`);
    const info = await transporter.sendMail({
      from: `"${process.env.MAIL_SENDER_NAME}" <${process.env.MAIL_SENDER_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log("Email sent successfully: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Email sending error: ", error);
    throw error;
  }
};

module.exports = { sendEmail };
