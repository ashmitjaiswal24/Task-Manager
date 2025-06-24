const nodemailer = require('nodemailer');

const pendingUsers = {}; // { email: { username, email, password, otp, otpExpiry } }

async function sendEmail(to, subject, text) {
  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'cse21161@glbitm.ac.in',      // <-- your Gmail address
      pass: 'yhyq qnvi tokz uwap',              // <-- your Gmail app password
    },
  });

  await transporter.sendMail({
    from: 'cse21161@glbitm.ac.in', // <-- your Gmail address
    to, // <-- this is dynamic, comes from registration
    subject,
    text,
  })
  .then(() => console.log('Email sent!'))
  .catch((err) => console.error('Failed to send OTP email:', err));
}

module.exports = sendEmail;