import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail", // Using Gmail SMTP; switch to any provider if needed
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Gmail App Password, not your normal password
      }
    });
  }

  return transporter;
}

export async function sendEmail({ to, subject, html }) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html
  };

  await getTransporter().sendMail(mailOptions);
}
