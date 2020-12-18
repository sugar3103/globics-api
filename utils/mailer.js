const nodemailer = require('nodemailer')
const Utils = require('./allUtils')
const jwtSecret = process.env.jwt_secret
const url = require('url')

const { mailer_user, mailer_password, mailer_name } = process.env
const sendEmail = async (mailOptions) => {
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: mailer_user,
      pass: mailer_password
    }
  })
  try {
    const info = await transporter.sendMail(mailOptions)
    console.info('Email sent: %s', info.messageId)
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

exports.sendSignUpInEmail = async (req, user, ranNum) => {
  // send mail with defined transport object
  const mailOptions = {
    from: mailer_name, // sender address
    to: user.get('email'), // list of receivers
    subject: 'Globics Customer Account Login', // Subject line
    html: `<h3>Thanks for registered with Globics!</h3> 
           </br>
          Please sign in with this activation code
          <br>
          <h1>${ranNum}</h1>`
  }

  for (let i = 0; i < 3; i++) {
    if (await sendEmail(mailOptions)) {
      break
    } else {
      console.error(`Error (${i}): send email to ${mailOptions.to}`)
      if (i < 2) await Utils.timeout(60000)
    }
  }
}

exports.sendResetPasswordEmail = (req, user, resetURL) => {
  // console.info('Reset Password Link: ' + resetURL);

  const mailOptions = {
    from: mailer_name, // sender address
    to: user.get('email'), // list of receivers
    subject: 'Globics Reset Your Password', // Subject line
    html: `You are receiving this email because we received a password request for your account. 
        Click on this link to <a href="${resetURL}">Reset Your Password</a>.
        Please be notice that the reset link will be expired in 5 minutes, exceeded this time please request another one`
  }

  sendEmail(mailOptions)
}

exports.mailToVerifyEmail = async (req, userId, receiverEmail) => {
  const code = Utils.generatePassword(
    userId + receiverEmail + jwtSecret,
    null,
    'hex'
  )
  const path = `/api/users/verify/${userId}/${receiverEmail}/${code}`
  const verifyUrl = url.format({
    protocol: 'https',
    host: req.get('host'),
    pathname: path
  })

  const mailOptions = {
    from: mailer_name, // sender address
    to: receiverEmail, // list of receivers
    subject: 'Verify Your New Email Address', // Subject line
    html: `<a href="${verifyUrl}">Verify your email address</a>`
  }
  sendEmail(mailOptions)
}
