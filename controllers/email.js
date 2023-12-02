const nodemailer = require('nodemailer')

const sendEmail = async ({ to, subject, text }) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_NOTIFIER_HOST,
    port: process.env.EMAIL_NOTIFIER_PORT,
    auth: {
      user: process.env.EMAIL_NOTIFIER_USERNAME,
      pass: process.env.EMAIL_NOTIFIER_PASSWORD,
    },
    // Activate in gmail 'less secure app' option
  })
  // 2) Define the email options
  const emailOptions = {
    from: 'Maksym from WanderWise Tours <wander-wise@tours.com',
    to,
    subject,
    text,
    // html,
  }

  // 3) Actually send the email
  await transporter.sendMail(emailOptions)
}

module.exports = sendEmail
