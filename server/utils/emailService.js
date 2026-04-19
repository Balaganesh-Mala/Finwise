const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT, 10),
  secure: parseInt(process.env.MAIL_PORT, 10) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, 
  },
  // Add timeout settings
  connectionTimeout: 30000, // 30 seconds
  greetingTimeout: 15000,   // 15 seconds
  socketTimeout: 30000,     // 30 seconds
  // Disable verbose debug/logger to clean up console
  debug: false,
  logger: false
});


// Verify connection configuration immediately
transporter.verify(function (error, success) {
  if (error) {
    console.error(`❌ SMTP Connection Error: ${error.message} (${process.env.MAIL_HOST})`);
  }
});

const sendEmail = async (to, subject, html, reqAttachments = []) => {
  try {
    const senderName = (process.env.MAIL_SENDER_NAME || 'wonew.in').replace(/^"|"$/g, '');
    const senderEmail = process.env.MAIL_SENDER_EMAIL || 'info@wonew.in';
    const fromAddress = `"${senderName}" <${senderEmail}>`;

    console.log(`Sending email to: ${to} via ${process.env.MAIL_HOST}`);
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
      attachments: reqAttachments || [], // Support for PDF receipts
    });
    console.log("Email sent successfully: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Email sending error: ", error);
    throw error;
  }
};

module.exports = { sendEmail };
