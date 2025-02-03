const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// async..await is not allowed in global scope, must use a wrapper
const sendEmail = async (email, name, token) => {
  const confirmationUrl = `${process.env.FRONTEND_URL}/confirm-email?token=${token}`;
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: 'Dwello" <jaybuck403@gmail.com>', // sender address
    to: email, // list of receivers
    subject: 'Confirm Your Email Address',
    html: `<p>Hi ${name},</p>
       <p>Please confirm your email by clicking the link below:</p>
       <a href="${confirmationUrl}">Confirm Email</a>`
  });

  console.log("Message sent: %s", info.messageId);

}

module.exports = { sendEmail };