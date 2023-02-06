const nodeMailer = require('nodemailer')

const sendEmail = async (options) => {
  // const transporter = nodeMailer.createTransport({
  //   service: process.env.SMTP_SERVICE,
  //   auth: {
  //     user: process.env.SMPT_MAIL,
  //     pass: process.env.SMPT_PASSWORD,
  //   },
  // })

  const transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD,
    },
  })

  const mailOptions = {
    from: process.env.SMPT_MAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  }

  await transporter.sendMail(mailOptions)
}

module.exports = sendEmail
